import { Button } from "../ui/button";
import { Upload, X, Trash2, RefreshCw } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { videoService } from "../../services/videoService";
import { Video } from "@/types/video.d";
import { useToast } from "../ui/use-toast";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  onVideoSelect?: (video: Video | null) => void;
  selectedVideoId?: string;
}

export function Sidebar({
  isOpen,
  onClose,
  onVideoSelect,
  selectedVideoId,
}: SidebarProps) {
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadVideo();
  }, []);

  const loadVideo = async () => {
    try {
      setIsLoading(true);
      const userVideo = await videoService.getUserVideo();
      setCurrentVideo(userVideo);
      if (userVideo && onVideoSelect) {
        onVideoSelect(userVideo);
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

      if (currentVideo) {
        if (!confirm("This will replace your current video. Continue?")) {
          return;
        }
        // Clear current video first
        if (onVideoSelect) {
          onVideoSelect(null);
        }
        setCurrentVideo(null);
      }

      const uploadedVideo = await videoService.uploadVideo(file);
      setCurrentVideo(uploadedVideo);
      if (onVideoSelect) {
        onVideoSelect(uploadedVideo);
      }

      toast({
        title: "Success",
        description: "Video uploaded successfully!",
      });
    } catch (error) {
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
            className="lg:hidden absolute top-2 right-2 p-1 text-white hover:text-gray-300"
          >
            <X size={20} />
          </button>
        )}

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

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Current Video</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={loadVideo}
            disabled={isLoading}
            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </Button>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw size={24} className="animate-spin text-white/60" />
            </div>
          ) : !currentVideo ? (
            <div className="bg-[#3a3a3a] rounded-lg p-4 text-center">
              <p className="text-white/60 text-sm my-8">
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
                <img
                  src={videoService.getThumbnailUrl(currentVideo.id)}
                  alt={getVideoName(currentVideo)}
                  className="w-full h-full object-cover"
                  onError={(event) => {
                    (event.target as HTMLImageElement).style.backgroundColor =
                      "#1e1a2b";
                  }}
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm truncate">{getVideoName(currentVideo)}</p>
                <button
                  className="p-1 text-white/60 hover:text-white"
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
