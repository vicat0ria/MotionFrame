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

  /** Ensure the `video` object has a playable `url` */
  const attachUrl = async (video: Video): Promise<Video> => {
    if (video.url) return video;
    const key = video.videoId ?? video.id;
    return { ...video, url: videoService.getVideoUrl(key) };
  };

  /** Load the most recent user video (with URL) */
  const loadVideo = async () => {
    try {
      setIsLoading(true);
      const rawVideo = await videoService.getUserVideo();
      if (!rawVideo) {
        setCurrentVideo(null);
        if (onVideoSelect) onVideoSelect(null);
        return;
      }

      const videoWithUrl = await attachUrl(rawVideo);
      setCurrentVideo(videoWithUrl);
      if (onVideoSelect) onVideoSelect(videoWithUrl);
    } catch (err) {
      console.error("Failed to load video:", err);
      toast({ title: "Error", description: "Failed to load your video." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVideo();
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Upload flow                                                       */
  /* ------------------------------------------------------------------ */

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const file = files[0];
    if (!file.type.startsWith("video/")) {
      toast({ title: "Error", description: "Please select a video file." });
      return;
    }

    try {
      setIsUploading(true);
      if (currentVideo && !confirm("Replace your current video?")) return;

      const uploaded = await videoService.uploadVideo(file);
      const uploadedWithUrl = await attachUrl(uploaded);

      setCurrentVideo(uploadedWithUrl);
      if (onVideoSelect) onVideoSelect(uploadedWithUrl);

      toast({ title: "Success", description: "Video uploaded." });
    } catch (err) {
      console.error("Upload failed:", err);
      toast({ title: "Error", description: "Failed to upload video." });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Delete flow                                                       */
  /* ------------------------------------------------------------------ */

  const handleDeleteVideo = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentVideo || isDeleting) return;
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      setIsDeleting(true);
      await videoService.deleteVideo(currentVideo.id);
      setCurrentVideo(null);
      if (onVideoSelect) onVideoSelect(null);
      toast({ title: "Success", description: "Video deleted." });
    } catch (err) {
      console.error("Delete failed:", err);
      toast({ title: "Error", description: "Failed to delete video." });
    } finally {
      setIsDeleting(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */

  const getVideoName = (video: Video) => {
    if (video.title?.length) {
      if (video.title.length > 20) {
        const ext = video.title.split(".").pop() || "";
        return `${video.title.substring(0, 18)}...${ext ? "." + ext : ""}`;
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
        {/* Close button for mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden absolute top-2 right-2 p-1 text-white hover:text-gray-300"
          >
            <X size={20} />
          </button>
        )}

        {/* hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="video/*"
          onChange={handleFileChange}
        />

        {/* Upload / replace button */}
        <Button
          className="w-full bg-green-600 hover:bg-green-700 mb-4"
          onClick={handleUploadClick}
          disabled={isUploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {isUploading
            ? "Uploading…"
            : currentVideo
            ? "Replace Video"
            : "Import Video"}
        </Button>

        {/* Current video list */}
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
                  const videoWithUrl = await attachUrl(currentVideo);
                  setCurrentVideo(videoWithUrl);
                  if (onVideoSelect) onVideoSelect(videoWithUrl);
                } catch {
                  toast({
                    title: "Video not ready",
                    description: "This video is still processing.",
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
                  onError={(e) =>
                    ((e.target as HTMLImageElement).style.backgroundColor =
                      "#1e1a2b")
                  }
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
                    <span className="animate-pulse">…</span>
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
