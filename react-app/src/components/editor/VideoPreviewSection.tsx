import { useEffect, useState } from "react";
import type { VideoState } from "@/types/video";
import skeletonPlaceholder from "@/assets/Skeleton-Extract-Placeholder.png";
import previewPlaceholder from "@/assets/Preview-Placeholder.png";

interface VideoPreviewSectionProps {
  videoState: VideoState;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  handleMetadataLoaded: () => void;
  handleTimeUpdate: () => void;
  handleVideoError: () => void;
  toggleFullscreen: () => void;
}

export const VideoPreviewSection = ({
  videoState,
  videoRef,
  handleMetadataLoaded,
  handleTimeUpdate,
  handleVideoError,
  toggleFullscreen,
}: VideoPreviewSectionProps) => {
  const { video, isLoading, error } = videoState ?? {
    video: null,
    isLoading: false,
    error: null,
  };
  const [isPreparing, setIsPreparing] = useState(false);

  // ───── load / reload video when its URL changes ─────
  useEffect(() => {
    if (!videoRef.current || !video?.url) return;

    setIsPreparing(true);
    videoRef.current.src = video.url; // pre-signed URL
    videoRef.current.load();
    setIsPreparing(false);
  }, [video?.url, videoRef]);

  return (
    <>
      {/* ─────────────── Skeleton Extract ─────────────── */}
      <div className="flex-1 flex flex-col h-full">
        <div
          className="flex-1 flex flex-col rounded-lg overflow-hidden border border-[#3a3a3a] shadow-lg text-white"
          style={{ backgroundColor: "#2c223e" }}
        >
          <div
            className="flex justify-between items-center px-4 py-3"
            style={{ backgroundColor: "#3a3a3a" }}
          >
            <h3 className="text-base font-medium text-white">
              Skeleton Extract
            </h3>
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            <div
              className="relative w-[85%] mx-auto rounded-lg border border-[#3a3a3a] overflow-hidden"
              style={{ backgroundColor: "#1e1a2b", aspectRatio: "16/9" }}
            >
              {video && !error ? (
                <>
                  {(isLoading || isPreparing) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
                    </div>
                  )}

                  <video
                    ref={videoRef}
                    playsInline
                    controls={false}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleMetadataLoaded}
                    onError={handleVideoError}
                    onDoubleClick={toggleFullscreen}
                    className="w-full h-full object-cover"
                  />
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <img
                    src={skeletonPlaceholder}
                    alt="Skeleton Extract Placeholder"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────── Preview (static) ─────────────── */}
      <div className="flex-1 flex flex-col">
        <div
          className="flex-1 flex flex-col rounded-lg overflow-hidden border border-[#3a3a3a] shadow-lg text-white"
          style={{ backgroundColor: "#2c223e" }}
        >
          <div
            className="flex justify-between items-center px-4 py-3"
            style={{ backgroundColor: "#3a3a3a" }}
          >
            <h3 className="text-base font-medium text-white">Preview</h3>
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            <div
              className="relative w-[85%] mx-auto rounded-lg border border-[#3a3a3a] overflow-hidden"
              style={{ backgroundColor: "#1e1a2b", aspectRatio: "16/9" }}
            >
              <img
                src={previewPlaceholder}
                alt="Preview Placeholder"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
