import { useState, useRef, useEffect } from "react";
import { Video } from "@/types/video";
import { videoService } from "@/services/videoService";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Upload, X, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import skeletonPlaceholder from "../../assets/Skeleton-Extract-Placeholder.png";
import { io } from "socket.io-client";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  onVideoSelect?: (video: Video | null) => void;
  selectedVideoId?: string;
  videoTitle?: string;
  onBack?: () => void;
  onProcessing?: (processing: boolean) => void;
}

export function Sidebar({
  isOpen,
  onClose,
  onVideoSelect,
  selectedVideoId,
  videoTitle,
  onBack,
  onProcessing,
}: SidebarProps) {
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isThumbnailLoaded, setIsThumbnailLoaded] = useState(false);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);
  const SOCKET_URL = import.meta.env.VITE_API_URL.replace("/api", "");

  // Cleanup function for video processing
  const cleanupProcessing = () => {
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
    isProcessingRef.current = false;
    setIsProcessing(false);
    onProcessing?.(false);
    setProgress(0);
    setProcessingId(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupProcessing();
    };
  }, []);

  // Subscribe to progress events during processing
  useEffect(() => {
    if (isProcessing && processingId) {
      const socket = io(SOCKET_URL, { withCredentials: true });
      socket.on("video:progress", (data: { id: string; progress: number }) => {
        if (data.id === processingId) {
          setProgress(data.progress);
        }
      });
      socket.on("video:error", (data: { id: string; error: string }) => {
        if (data.id === processingId) {
          cleanupProcessing();
        }
      });
      return () => {
        socket.off("video:progress");
        socket.off("video:error");
        socket.disconnect();
      };
    }
  }, [isProcessing, processingId]);

  // Handle back button with processing check
  const handleBackWithCheck = () => {
    if (isProcessingRef.current) {
      if (
        confirm(
          "Video is still processing. Are you sure you want to leave? This will cancel the processing."
        )
      ) {
        cleanupProcessing();
        if (onBack) onBack();
        else navigate("/");
      }
    } else {
      if (onBack) onBack();
      else navigate("/");
    }
  };

  const loadVideo = async () => {
    try {
      setIsLoading(true);
      if (!selectedVideoId) {
        console.log("No selected video ID, skipping load");
        return;
      }

      // Skip if we've already loaded this video
      if (isVideoLoaded && currentVideo?.id === selectedVideoId) {
        console.log(`Video ${selectedVideoId} already loaded, skipping`);
        return;
      }

      console.log(`Loading video with selected ID: ${selectedVideoId}`);
      const videoUrl = await videoService.getVideoUrl(selectedVideoId);

      // Create video object with the correct ID
      const video = {
        id: selectedVideoId,
        title: videoTitle || "Untitled Video",
        url: videoUrl.url,
        videoId: selectedVideoId,
        duration: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log(`Setting current video with ID: ${selectedVideoId}`);
      setCurrentVideo(video);
      setIsVideoLoaded(true);

      // Load thumbnail only if we haven't loaded it yet
      if (!isThumbnailLoaded) {
        const thumbnailUrl = videoService.getThumbnailUrl(selectedVideoId);
        const timestamp = new Date().getTime();
        const urlWithTimestamp = `${thumbnailUrl}?t=${timestamp}`;
        console.log(
          `Setting thumbnail URL for ID ${selectedVideoId}: ${urlWithTimestamp}`
        );
        setThumbnailUrl(urlWithTimestamp);
        setIsThumbnailLoaded(true);
      }
    } catch (error) {
      console.error("Failed to load video:", error);
      toast({
        title: "Error",
        description: "Failed to load your video. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset loaded states when video ID changes
  useEffect(() => {
    setIsVideoLoaded(false);
    setIsThumbnailLoaded(false);
  }, [selectedVideoId]);

  // Load video when selectedVideoId changes
  useEffect(() => {
    if (selectedVideoId && !isVideoLoaded) {
      loadVideo();
    }
  }, [selectedVideoId, isVideoLoaded]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Error",
        description: "Please select a valid video file.",
      });
      return;
    }

    try {
      setIsUploading(true);
      setIsVideoLoaded(false);
      setIsThumbnailLoaded(false);
      isProcessingRef.current = true;
      setIsProcessing(true);
      onProcessing?.(true);

      if (currentVideo) {
        if (!confirm("This will replace your current video. Continue?")) {
          return;
        }
        // Clear current video first
        if (onVideoSelect) {
          onVideoSelect(null);
        }
        setCurrentVideo(null);
        setThumbnailUrl(null);
      }

      const uploadedVideo = await videoService.uploadVideo(file);
      console.log(`Uploaded new video with ID: ${uploadedVideo.id}`);
      setProcessingId(uploadedVideo.id);

      // Wait for the video to be processed
      let retries = 0;
      const maxRetries = 30;
      const retryDelay = 3000;

      const checkVideoReady = async () => {
        if (!isProcessingRef.current) {
          console.log("Processing cancelled");
          return;
        }

        try {
          console.log(
            `Checking video status (attempt ${retries + 1}/${maxRetries})`
          );
          const status = await videoService.getProcessingStatus(
            uploadedVideo.id
          );
          console.log(
            `Video status: ${status.status}, progress: ${status.progress}%`
          );

          if (status.status === "completed") {
            cleanupProcessing();
            // Get fresh project data
            const freshVideo = await videoService.getUserVideo();
            if (freshVideo) {
              console.log(
                `Video processing completed, setting new video with ID: ${freshVideo.id}`
              );
              setCurrentVideo(freshVideo);
              if (onVideoSelect) {
                onVideoSelect(freshVideo);
              }
              setIsVideoLoaded(true);
              // Refresh thumbnail URL to bust cache after processing
              const thumbUrl = `${videoService.getThumbnailUrl(
                freshVideo.id
              )}?t=${Date.now()}`;
              setThumbnailUrl(thumbUrl);
              setIsThumbnailLoaded(true);

              toast({
                title: "Success",
                description: "Video processing completed successfully!",
              });
            }
          } else if (status.status === "failed") {
            cleanupProcessing();
            console.error("Video processing failed with status:", status);

            // Log the full error state for debugging
            console.error("Full processing state:", {
              status: status.status,
              progress: status.progress,
              timestamp: new Date().toISOString(),
            });

            // Show a more specific error message
            toast({
              title: "Processing Failed",
              description:
                "The video processing failed. Please try uploading a different video file (MP4 format recommended).",
            });

            // Reset the file input
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }

            // Clear the current video state
            setCurrentVideo(null);
            if (onVideoSelect) {
              onVideoSelect(null);
            }

            throw new Error(
              `Video processing failed: ${JSON.stringify(status)}`
            );
          } else if (retries < maxRetries) {
            retries++;
            console.log(`Retrying in ${retryDelay}ms...`);
            processingTimeoutRef.current = setTimeout(
              checkVideoReady,
              retryDelay
            );
          } else {
            cleanupProcessing();
            console.error("Max retries reached without completion");
            toast({
              title: "Processing Timeout",
              description:
                "Video processing is taking longer than expected. Please try again later.",
            });
            throw new Error("Video processing timeout");
          }
        } catch (error) {
          console.error("Error checking video status:", error);
          if (retries < maxRetries && isProcessingRef.current) {
            retries++;
            console.log(`Retrying after error in ${retryDelay}ms...`);
            processingTimeoutRef.current = setTimeout(
              checkVideoReady,
              retryDelay
            );
          } else {
            cleanupProcessing();
            toast({
              title: "Error",
              description:
                "Failed to process video. Please try again with a different video file.",
            });
            // Reset the file input
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }
        }
      };

      // Start checking video status
      checkVideoReady();

      toast({
        title: "Success",
        description: "Video uploaded successfully! Processing...",
      });
    } catch (error) {
      cleanupProcessing();
      console.error("Upload failed:", error);
      if (fileInputRef.current) fileInputRef.current.value = "";

      const err = error as {
        response?: { status: number; data?: { message?: string } };
      };
      if (err.response?.status === 507) {
        toast({
          title: "Storage Quota Exceeded",
          description:
            "You've reached your storage limit. Please delete existing videos.",
        });
      } else {
        toast({
          title: "Error",
          description:
            err.response?.data?.message ||
            "Failed to upload video. Please try again.",
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteVideo = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentVideo) return;
    if (isDeleting) return;

    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      setIsDeleting(true);
      await videoService.deleteVideo(currentVideo.id);
      setCurrentVideo(null);
      if (onVideoSelect) {
        onVideoSelect(null);
      }
      toast({
        title: "Success",
        description: "Video deleted successfully!",
      });
    } catch (error) {
      console.error("Failed to delete video:", error);
      toast({
        title: "Error",
        description: "Failed to delete video. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getVideoName = (video: Video) => {
    if (videoTitle) {
      return videoTitle;
    }
    if (video && typeof video.title === "string" && video.title.length > 0) {
      if (video.title.length > 20) {
        const extension = video.title.split(".").pop() || "";
        return `${video.title.substring(0, 18)}...${
          extension ? "." + extension : ""
        }`;
      }
      return video.title;
    }
    return `Video ${video.id.substring(0, 8)}`;
  };

  return (
    <div
      className={`fixed lg:static lg:block w-64 bg-[#413946] h-screen overflow-y-auto transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div className="p-4">
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden absolute top-2 right-2 p-1 text-foreground hover:text-gray-300"
          >
            <X size={20} />
          </button>
        )}

        <Button
          className="w-full bg-purple-600 hover:bg-purple-700 mb-4"
          onClick={handleBackWithCheck}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="video/*"
          onChange={handleFileChange}
        />

        <Button
          className="w-full bg-green-600 hover:bg-green-700 mb-4"
          onClick={handleUploadClick}
          disabled={isUploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {isUploading
            ? "Uploading..."
            : currentVideo
            ? "Replace Video"
            : "Import Video"}
        </Button>

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Current Video
          </h2>
        </div>

        <div className="space-y-4">
          {isProcessing ? (
            <div className="bg-[#3a3a3a] rounded-lg text-center overflow-hidden">
              <div className="relative w-full">
                <img
                  src={skeletonPlaceholder}
                  alt="Processing placeholder"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 z-10">
                  <svg className="w-12 h-12">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="#444"
                      strokeWidth="4"
                      fill="none"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="#fff"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={126}
                      strokeDashoffset={126 - (progress / 100) * 126}
                    />
                  </svg>
                </div>
              </div>
              <p className="text-foreground/60 text-sm mt-2">{progress}%</p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60" />
            </div>
          ) : !currentVideo ? (
            <div className="bg-[#3a3a3a] rounded-lg p-4 text-center">
              <p className="text-foreground/60 text-sm my-8">
                No video uploaded yet. Click "Import Video" to get started.
              </p>
            </div>
          ) : (
            <div
              key={currentVideo.id}
              className={`bg-[#3a3a3a] rounded-lg p-2 cursor-pointer transition-all duration-200 hover:bg-[#4a4a4a] ${
                selectedVideoId === currentVideo.id
                  ? "ring-2 ring-purple-500"
                  : ""
              }`}
              onClick={async () => {
                try {
                  await videoService.getVideoUrl(currentVideo.id);
                  if (onVideoSelect) onVideoSelect(currentVideo);
                } catch {
                  toast({
                    title: "Video not ready",
                    description:
                      "This video is still processing or unavailable.",
                  });
                  setCurrentVideo(null);
                }
              }}
            >
              <div className="aspect-video bg-[#2a2a2a] rounded mb-2 overflow-hidden relative">
                {thumbnailUrl && (
                  <img
                    src={thumbnailUrl}
                    alt={getVideoName(currentVideo)}
                    className="w-full h-full object-cover"
                    onError={(event) => {
                      (event.target as HTMLImageElement).style.backgroundColor =
                        "#1e1a2b";
                    }}
                  />
                )}
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm truncate">{getVideoName(currentVideo)}</p>
                <button
                  className="p-1 text-foreground/60 hover:text-foreground"
                  onClick={handleDeleteVideo}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
