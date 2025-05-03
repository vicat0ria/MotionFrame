import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/editor/Sidebar";
import { SettingsPanel } from "@/components/editor/SettingsPanel";
import { Menu } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { VideoState, EditorSettings } from "@/types/video.d";
import { TimelineSlider } from "@/components/editor/TimelineSlider";
import { VideoPreviewSection } from "@/components/editor/VideoPreviewSection";
import { PlaybackControls } from "@/components/editor/PlaybackControls";
import { Video } from "@/types/video.d";

export default function VideoEditor() {
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Video State
  const [videoState, setVideoState] = useState<VideoState>({
    video: null,
    videoTitle: "Untitled Video",
    videoDuration: 0,
    currentTime: 0,
    isPlaying: false,
    isLoading: false,
    error: null,
  });

  // Editor Settings
  const [settings, setSettings] = useState<EditorSettings>({
    playbackSpeed: 1.0,
    smoothness: 0.5,
    selectedAvatar: 0,
  });

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  // Update video title
  const updateVideoTitle = (title: string) => {
    setVideoState((prev) => ({ ...prev, videoTitle: title }));
  };

  // Handle video selection from sidebar
  const handleVideoSelect = (video: Video | null) => {
    setVideoState({
      video,
      videoTitle: video?.title || "Untitled Video",
      currentTime: 0,
      videoDuration: 0,
      isPlaying: false,
      isLoading: !!video,
      error: null,
    });

    // Pause any playing video
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // Playback controls
  const togglePlayPause = () => {
    const { video, error, isPlaying } = videoState;
    if (!videoRef.current || !video || error) return;

    // Set transitioning state to prevent rapid toggle
    const currentTime = Date.now();
    const lastToggleTime = videoRef.current.dataset.lastToggleTime
      ? Number(videoRef.current.dataset.lastToggleTime)
      : 0;

    // If toggled too quickly (within 300ms), ignore this request
    if (currentTime - lastToggleTime < 300) {
      return;
    }

    // Update last toggle time
    videoRef.current.dataset.lastToggleTime = currentTime.toString();

    if (isPlaying) {
      videoRef.current.pause();
      setVideoState((prev) => ({ ...prev, isPlaying: false }));
    } else {
      // Update state before attempting to play to avoid race conditions
      setVideoState((prev) => ({ ...prev, isPlaying: true }));

      videoRef.current.play().catch((error) => {
        // Ignore AbortError as it's typically caused by a quick pause after play
        if (error.name !== "AbortError") {
          toast({
            title: "Playback Error",
            description: "Could not play this video. Please try again.",
          });
          console.error("Video playback error:", error);
          setVideoState((prev) => ({
            ...prev,
            isPlaying: false,
            error: "Failed to play video",
          }));
        }
      });
    }
  };

  const skipForward = () => {
    const { video, error } = videoState;
    if (!videoRef.current || !video || error) return;

    const newTime = Math.min(
      videoRef.current.currentTime + 10,
      videoRef.current.duration
    );
    videoRef.current.currentTime = newTime;
    setVideoState((prev) => ({ ...prev, currentTime: newTime }));
  };

  const skipBackward = () => {
    const { video, error } = videoState;
    if (!videoRef.current || !video || error) return;

    const newTime = Math.max(videoRef.current.currentTime - 10, 0);
    videoRef.current.currentTime = newTime;
    setVideoState((prev) => ({ ...prev, currentTime: newTime }));
  };

  // Update playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = settings.playbackSpeed;
    }
  }, [settings.playbackSpeed]);

  // Keyboard shortcuts
  useEffect(() => {
    const { video, error } = videoState;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!video || error) return;

      switch (e.key) {
        case " ":
          // Space bar toggles play/pause
          e.preventDefault();
          togglePlayPause();
          break;
        case "ArrowRight":
          // Right arrow skips forward
          e.preventDefault();
          skipForward();
          break;
        case "ArrowLeft":
          // Left arrow skips backward
          e.preventDefault();
          skipBackward();
          break;
        case "f":
          // 'f' key toggles fullscreen
          if (videoRef.current && document.activeElement !== document.body)
            return;
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [videoState.video, videoState.error]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    if (!document.fullscreenElement) {
      // Enter fullscreen
      videoRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      // Exit fullscreen
      document.exitFullscreen().catch((err) => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  };

  // Update video time
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      // Force a state update with the current time
      const currentTime = videoRef.current.currentTime;
      const videoDuration = videoRef.current.duration || 0;

      setVideoState((prev) => ({
        ...prev,
        currentTime,
        videoDuration,
        isPlaying: !videoRef.current?.paused,
      }));
    }
  };

  // Handle slider change for playback position
  const handleSliderChange = (value: number[]) => {
    const { video, error, videoDuration } = videoState;
    if (!videoRef.current || !video || error) return;

    const newTime = (value[0] / 100) * videoDuration;
    videoRef.current.currentTime = newTime;
    setVideoState((prev) => ({ ...prev, currentTime: newTime }));
  };

  // Handle video loaded metadata
  const handleMetadataLoaded = () => {
    if (videoRef.current) {
      setVideoState((prev) => ({
        ...prev,
        videoDuration: videoRef.current!.duration,
        isLoading: false,
      }));
    }
  };

  // Handle video loading error
  const handleVideoError = () => {
    setVideoState((prev) => ({
      ...prev,
      error: "Failed to load video",
      isLoading: false,
    }));

    toast({
      title: "Video Error",
      description:
        "Failed to load the video. The file may be corrupt or deleted.",
    });
  };

  // Format time (seconds) to MM:SS format
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Calculate slider value based on current time
  const calculateSliderValue = () => {
    const { videoDuration, currentTime } = videoState;
    if (videoDuration === 0) return [0];
    return [(currentTime / videoDuration) * 100];
  };

  // Settings updaters
  const updatePlaybackSpeed = (value: number) => {
    setSettings((prev) => ({ ...prev, playbackSpeed: value }));
  };

  const updateSmoothness = (value: number) => {
    setSettings((prev) => ({ ...prev, smoothness: value }));
  };

  const updateSelectedAvatar = (value: number) => {
    setSettings((prev) => ({ ...prev, selectedAvatar: value }));
  };

  return (
    <div
      className="flex h-screen overflow-hidden text-white"
      style={{ backgroundColor: "#1a1a1a" }}
    >
      {/* Mobile Sidebar Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-purple-600 hover:bg-purple-700"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <div
        className="w-64 h-full text-white"
        style={{ backgroundColor: "#413946" }}
      >
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onVideoSelect={handleVideoSelect}
          selectedVideoId={videoState.video?.id}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div
          className="p-4 flex justify-between items-center"
          style={{ backgroundColor: "#2c223e" }}
        >
          {/* Empty div for spacing */}
          <div className="w-24" />

          {/* Title Input */}
          <input
            type="text"
            value={videoState.videoTitle}
            onChange={(e) => updateVideoTitle(e.target.value)}
            className="bg-transparent text-center text-xl font-semibold focus:outline-none focus:border-b-2 focus:border-purple-500 px-4 py-1 max-w-md"
            style={{ minWidth: "200px" }}
          />

          {/* Export Button */}
          <div className="w-24 flex justify-end">
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!videoState.video || !!videoState.error}
            >
              Export
            </Button>
          </div>
        </div>

        {/* Video Preview Area */}
        <div
          className="flex-1 p-4 flex flex-col lg:flex-row gap-8 min-h-[350px] overflow-y-auto"
          style={{ backgroundColor: "#2c223e" }}
        >
          {/* Video Preview Components */}
          <VideoPreviewSection
            videoState={videoState}
            videoRef={videoRef}
            handleMetadataLoaded={handleMetadataLoaded}
            handleTimeUpdate={handleTimeUpdate}
            handleVideoError={handleVideoError}
            toggleFullscreen={toggleFullscreen}
          />
        </div>

        {/* Timeline Slider */}
        <TimelineSlider
          videoState={videoState}
          formatTime={formatTime}
          calculateSliderValue={calculateSliderValue}
          handleSliderChange={handleSliderChange}
        />

        {/* Playback Controls */}
        <PlaybackControls
          videoState={videoState}
          togglePlayPause={togglePlayPause}
          skipBackward={skipBackward}
          skipForward={skipForward}
          selectedAvatar={settings.selectedAvatar}
          updateSelectedAvatar={updateSelectedAvatar}
        />

        {/* Settings Panel */}
        <div style={{ backgroundColor: "#1e1a2b" }} className="overflow-y-auto">
          <SettingsPanel
            playbackSpeed={settings.playbackSpeed}
            onPlaybackSpeedChange={updatePlaybackSpeed}
            smoothness={settings.smoothness}
            onSmoothnessChange={updateSmoothness}
            sliderClassName="[&>.relative]:bg-white/20 [&_[role=slider]]:bg-white [&_[data-orientation=horizontal]]:bg-purple-500"
          />
        </div>
      </div>
    </div>
  );
}
