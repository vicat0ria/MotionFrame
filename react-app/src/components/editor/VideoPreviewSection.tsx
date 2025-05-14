import { VideoState } from "@/types/video.d";
import skeletonPlaceholder from "../../assets/Skeleton-Extract-Placeholder.png";
import previewPlaceholder from "../../assets/Preview-Placeholder.png";
import { Maximize2 } from "lucide-react";
import { io } from "socket.io-client";
import { useState, useEffect, useRef } from "react";
import PoseViewer from "./PoseViewer";
import {
  videoService,
  Landmark,
  VideoMetadata,
  LandmarkResponse,
} from "@/services/videoService";

const SOCKET_URL = import.meta.env.VITE_API_URL.replace("/api", "");
const DEBUG_SYNC = true; // Set to false in production

interface VideoPreviewSectionProps {
  videoState: VideoState;
  setVideoState: React.Dispatch<React.SetStateAction<VideoState>>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  handleMetadataLoaded: () => void;
  handleTimeUpdate: () => void;
  handleVideoError: () => void;
  toggleFullscreen: () => void;
  isProcessing: boolean;
  smoothness: number;
}

interface SmoothedLandmarks {
  previousLandmarks: Landmark[];
  smoothingFactor: number;
}

export const VideoPreviewSection = ({
  videoState,
  setVideoState,
  videoRef,
  handleMetadataLoaded,
  handleTimeUpdate,
  handleVideoError,
  toggleFullscreen,
  isProcessing,
  smoothness,
}: VideoPreviewSectionProps) => {
  const [progress, setProgress] = useState(0);
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const smoothedLandmarksRef = useRef<SmoothedLandmarks>({
    previousLandmarks: [],
    smoothingFactor: smoothness,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(
    null
  );

  // Ref and state for the preview panel's dimensions
  const previewBoxRef = useRef<HTMLDivElement>(null);
  const [previewBoxSize, setPreviewBoxSize] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  // Hold only the current frame's landmarks
  const [currentLandmarks, setCurrentLandmarks] = useState<Landmark[]>([]);
  // State to hold all precomputed landmarks per frame
  const [allLandmarks, setAllLandmarks] = useState<Landmark[][]>([]);

  // Smoothing function
  const smoothLandmarks = (
    currentLandmarks: Landmark[],
    previousLandmarks: Landmark[],
    alpha: number
  ): Landmark[] => {
    if (!previousLandmarks.length) return currentLandmarks;

    // Invert alpha so 0 means maximum smoothing (frozen) and 1 means no smoothing (raw)
    const smoothingFactor = 1 - alpha;

    return currentLandmarks.map((landmark, i) => {
      const prev = previousLandmarks[i];
      if (!prev) return landmark;

      return {
        ...landmark,
        x: prev.x * smoothingFactor + landmark.x * (1 - smoothingFactor),
        y: prev.y * smoothingFactor + landmark.y * (1 - smoothingFactor),
        z: prev.z * smoothingFactor + landmark.z * (1 - smoothingFactor),
      };
    });
  };

  // Observe video element size changes and fullscreen
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const updateSize = () => {
      if (!videoEl) return;
      const rect = videoEl.getBoundingClientRect();
      setVideoSize({ width: rect.width, height: rect.height });
    };
    updateSize();
    const ro = new ResizeObserver(() => requestAnimationFrame(updateSize));
    ro.observe(videoEl);
    window.addEventListener("resize", updateSize);
    const handleFsChange = () => {
      const isFs = document.fullscreenElement === containerRef.current;
      setIsFullscreenMode(isFs);
      if (!isFs && videoState.video) {
        videoService
          .getLandmarks(videoState.video.id)
          .then((response) => {
            let meta: VideoMetadata | undefined;
            if (
              typeof response === "object" &&
              "landmarks" in response &&
              Array.isArray(response.landmarks)
            ) {
              if (response.metadata) {
                meta = response.metadata;
                setVideoMetadata(meta);
              }
            }
          })
          .catch((err) =>
            console.error(
              "Error re-fetching landmarks on exit fullscreen:",
              err
            )
          );
      }
      requestAnimationFrame(() => requestAnimationFrame(updateSize));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateSize);
      document.removeEventListener("fullscreenchange", handleFsChange);
    };
  }, [videoRef, containerRef, videoState.video, videoMetadata]);

  // Observe preview box size changes
  useEffect(() => {
    const element = previewBoxRef.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setPreviewBoxSize({ width, height });
      }
    });
    observer.observe(element);
    // Initial size set
    setPreviewBoxSize({
      width: element.clientWidth,
      height: element.clientHeight,
    });
    return () => observer.disconnect();
  }, []);

  // Recalculate video size when exiting or entering fullscreen to realign overlay
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const timeoutId = setTimeout(() => {
      const rect = videoEl.getBoundingClientRect();
      setVideoSize({ width: rect.width, height: rect.height });
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [isFullscreenMode]);

  // Fetch precomputed landmarks JSON for exact frame mapping
  useEffect(() => {
    if (videoState.video) {
      videoService
        .getLandmarks(videoState.video.id)
        .then((response: LandmarkResponse | Landmark[][]) => {
          let landmarksList: Landmark[][] = [];
          let meta: VideoMetadata | undefined;
          if (
            typeof response === "object" &&
            "landmarks" in response &&
            Array.isArray(response.landmarks)
          ) {
            landmarksList = response.landmarks;
            if (response.metadata) meta = response.metadata;
          } else if (Array.isArray(response)) {
            landmarksList = response;
          }
          if (meta) setVideoMetadata(meta);
          setAllLandmarks(landmarksList);
        })
        .catch((err) => console.error("Error fetching landmarks:", err));
    }
  }, [videoState.video]);

  // Update smoothedLandmarksRef when smoothness changes
  useEffect(() => {
    smoothedLandmarksRef.current.smoothingFactor = smoothness;
  }, [smoothness]);

  // Modify handleTimeUpdateWithJson to use inverted smoothing
  const handleTimeUpdateWithJson = (
    e: React.SyntheticEvent<HTMLVideoElement>
  ) => {
    handleTimeUpdate();
    if (allLandmarks.length > 0 && videoMetadata) {
      const videoEl = e.currentTarget as HTMLVideoElement;
      const currentTime = videoEl.currentTime;
      const videoDuration = videoEl.duration;

      // Calculate frame index using video progress ratio
      const progress = Math.min(currentTime / videoDuration, 1);
      const frameIndex = Math.min(
        Math.floor(progress * allLandmarks.length),
        allLandmarks.length - 1
      );

      // Log frame mapping info when debug is enabled
      if (DEBUG_SYNC) {
        console.log(
          `Time: ${currentTime.toFixed(3)}/${videoDuration.toFixed(3)} (${(
            progress * 100
          ).toFixed(1)}%) -> Frame ${frameIndex}/${allLandmarks.length - 1}`
        );
      }

      // Only update landmarks if we have valid data for this frame
      if (frameIndex >= 0 && frameIndex < allLandmarks.length) {
        const frameLandmarks = allLandmarks[frameIndex];
        if (frameLandmarks && frameLandmarks.length > 0) {
          // Always apply smoothing, but smoothness=1 will give raw data
          const smoothed = smoothLandmarks(
            frameLandmarks,
            smoothedLandmarksRef.current.previousLandmarks,
            smoothness
          );
          smoothedLandmarksRef.current.previousLandmarks = smoothed;
          setCurrentLandmarks(smoothed);
        }
      }
    }
  };

  // On video end, ensure we show the last valid frame
  const handleVideoEnded = () => {
    if (allLandmarks.length > 0) {
      const lastValidFrame = allLandmarks[allLandmarks.length - 1];
      if (lastValidFrame && lastValidFrame.length > 0) {
        setCurrentLandmarks(lastValidFrame);
      }
    }
  };

  useEffect(() => {
    if (isProcessing && videoState.video) {
      const socket = io(SOCKET_URL, { withCredentials: true });
      socket.on("video:progress", (data: { id: string; progress: number }) => {
        if (data.id === videoState.video?.id) setProgress(data.progress);
      });
      socket.on("video:error", (data) => {
        if (data.id === videoState.video?.id) setProgress(0);
      });
      return () => {
        socket.off("video:progress");
        socket.off("video:error");
        socket.disconnect();
      };
    } else {
      setProgress(0);
    }
  }, [isProcessing, videoState.video]);

  const handleFullscreenToggle = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch((err) => {
          console.error(
            `Error attempting to enable fullscreen: ${err.message}`
          );
        });
      } else {
        document.exitFullscreen();
      }
    } else {
      toggleFullscreen();
    }
  };

  return (
    <>
      {/* Skeleton Extract */}
      <div className="flex-1 flex flex-col h-full">
        <div
          className="flex-1 flex flex-col rounded-lg overflow-hidden border border-[#3a3a3a] shadow-lg text-foreground"
          style={{ backgroundColor: "#2c223e" }}
        >
          <div
            className="flex justify-between items-center px-4 py-3"
            style={{ backgroundColor: "#3a3a3a" }}
          >
            <h3 className="text-base font-medium text-foreground">
              Skeleton Extract
            </h3>
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            <div
              ref={containerRef}
              className="relative mx-auto rounded-lg border border-[#3a3a3a] overflow-hidden"
              style={{
                backgroundColor: "#1e1a2b",
                width: isFullscreenMode ? "100%" : "80%",
                height: isFullscreenMode ? "100%" : undefined,
                aspectRatio: isFullscreenMode ? undefined : "16/9",
              }}
            >
              {videoState.video && !videoState.error ? (
                <>
                  {videoState.isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                      {isProcessing ? (
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
                      ) : (
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                      )}
                    </div>
                  )}

                  <video
                    ref={videoRef}
                    src={videoState.video?.url}
                    controls={false}
                    playsInline
                    onTimeUpdate={handleTimeUpdateWithJson}
                    onEnded={handleVideoEnded}
                    onLoadedMetadata={(e) => {
                      handleMetadataLoaded();
                      const target = e.currentTarget;
                      setVideoSize({
                        width: target.clientWidth,
                        height: target.clientHeight,
                      });
                    }}
                    onError={(e) => {
                      console.error("Video error:", e);
                      if (
                        e.currentTarget.error?.code ===
                        MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
                      ) {
                        console.log(
                          "Video URL may have expired, attempting to refresh..."
                        );
                        setVideoState((prev) => ({
                          ...prev,
                          video: prev.video
                            ? {
                                ...prev.video,
                                url: prev.video.url + "?t=" + Date.now(),
                              }
                            : null,
                        }));
                      }
                      handleVideoError();
                    }}
                    className="w-full h-full object-contain"
                    key={`${videoState.video?.id}-${videoState.video?.url}`}
                  />

                  {/* Pose overlay */}
                  {currentLandmarks.length > 0 &&
                    videoSize.width > 0 &&
                    videoSize.height > 0 && (
                      <PoseViewer
                        key={`${videoSize.width}-${videoSize.height}`}
                        landmarks={currentLandmarks}
                        width={videoSize.width}
                        height={videoSize.height}
                      />
                    )}

                  {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-20">
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
                  )}

                  {DEBUG_SYNC && (
                    <div
                      className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded text-sm font-mono"
                      style={{ zIndex: 30 }}
                    >
                      Time: {videoRef.current?.currentTime.toFixed(3)}s
                      <br />
                      Frame:{" "}
                      {Math.min(
                        Math.floor(
                          (videoRef.current?.currentTime || 0) *
                            (allLandmarks.length /
                              (videoRef.current?.duration || 1))
                        ),
                        allLandmarks.length - 1
                      )}
                      <br />
                      FPS: {videoMetadata?.fps || 30}
                      <br />
                      Total Frames: {allLandmarks.length}
                    </div>
                  )}

                  <div
                    className="absolute right-4 bottom-4 bg-background/50 hover:bg-background/70 rounded-full p-2 cursor-pointer transition-colors"
                    onClick={handleFullscreenToggle}
                    title="Toggle fullscreen"
                  >
                    <Maximize2 className="w-5 h-5 text-foreground" />
                  </div>
                </>
              ) : (
                <div className="relative flex items-center justify-center h-full">
                  <img
                    src={skeletonPlaceholder}
                    alt="Skeleton Extract Placeholder"
                    className="w-full h-full object-cover"
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white/60"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 flex flex-col">
        <div
          className="flex-1 flex flex-col rounded-lg overflow-hidden border border-[#3a3a3a] shadow-lg text-foreground"
          style={{ backgroundColor: "#2c223e" }}
        >
          <div
            className="flex justify-between items-center px-4 py-3"
            style={{ backgroundColor: "#3a3a3a" }}
          >
            <h3 className="text-base font-medium text-foreground">Preview</h3>
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            <div
              ref={previewBoxRef}
              className="relative mx-auto rounded-lg border border-[#3a3a3a] overflow-hidden"
              style={{
                backgroundColor: "#1e1a2b",
                aspectRatio: "16/9",
                width: "80%",
              }}
            >
              {currentLandmarks.length > 0 &&
              previewBoxSize.width > 0 &&
              previewBoxSize.height > 0 ? (
                <PoseViewer
                  key={`preview-${previewBoxSize.width}-${previewBoxSize.height}`}
                  landmarks={currentLandmarks}
                  width={previewBoxSize.width}
                  height={previewBoxSize.height}
                />
              ) : (
                <img
                  src={previewPlaceholder}
                  alt="Preview Placeholder"
                  className="w-full h-full object-cover"
                />
              )}
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white/60"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
