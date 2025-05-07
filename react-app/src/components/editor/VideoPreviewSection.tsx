import { VideoState } from "@/types/video.d";
import skeletonPlaceholder from "../../assets/Skeleton-Extract-Placeholder.png";
import previewPlaceholder from "../../assets/Preview-Placeholder.png";
import { Maximize2 } from "lucide-react";

interface VideoPreviewSectionProps {
  videoState: VideoState;
  videoRef: React.RefObject<HTMLVideoElement>;
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
  return (
    <>
      {/* Skeleton Extract */}
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
              className="relative mx-auto rounded-lg border border-[#3a3a3a] overflow-hidden"
              style={{
                backgroundColor: "#1e1a2b",
                aspectRatio: "16/9",
                width: "80%",
              }}
            >
              {videoState.video && !videoState.error ? (
                <>
                  {videoState.isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                    </div>
                  )}

                  <video
                    ref={videoRef}
                    src={videoState.video?.url}
                    controls={false}
                    playsInline
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleMetadataLoaded}
                    onError={handleVideoError}
                    className="w-full h-full object-contain"
                  />

                  {/* Fullscreen button with absolute positioning */}
                  <div
                    className="absolute right-4 bottom-4 bg-black/50 hover:bg-black/70 rounded-full p-2 cursor-pointer transition-colors"
                    onClick={toggleFullscreen}
                    title="Toggle fullscreen"
                  >
                    <Maximize2 className="w-5 h-5 text-white" />
                  </div>
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

      {/* Preview */}
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
              className="relative mx-auto rounded-lg border border-[#3a3a3a] overflow-hidden"
              style={{
                backgroundColor: "#1e1a2b",
                aspectRatio: "16/9",
                width: "80%",
              }}
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
