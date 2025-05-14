import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/editor/Sidebar";
import { SettingsPanel } from "@/components/editor/SettingsPanel";
import { Menu } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  VideoState,
  EditorSettings,
  Video,
  VideoEditorLocationState,
} from "@/types/video.d";
import { TimelineSlider } from "@/components/editor/TimelineSlider";
import { VideoPreviewSection } from "@/components/editor/VideoPreviewSection";
import { PlaybackControls } from "@/components/editor/PlaybackControls";
import { useNavigate, useLocation } from "react-router-dom";
import { videoService } from "@/services/videoService";
import { projectService } from "@/services/projectService";

export default function VideoEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { project, settings: projectSettings } =
    (location.state as VideoEditorLocationState) || {};

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // Track sidebar upload/processing state
  const [isSidebarProcessing, setIsSidebarProcessing] = useState(false);

  // Initialize video state with project data if available
  const [videoState, setVideoState] = useState<VideoState>({
    video: null,
    videoTitle: project?.videoTitle || project?.title || "Untitled Video",
    videoDuration: 0,
    currentTime: 0,
    isPlaying: false,
    isLoading: false,
    error: null,
  });

  // Add loading state for URL refresh
  const [isRefreshingUrl, setIsRefreshingUrl] = useState(false);

  // Initialize settings with project settings if available
  const [settings, setSettings] = useState<EditorSettings>(() => {
    // First check if we have settings passed directly
    if (projectSettings) {
      return {
        playbackSpeed: projectSettings.playbackSpeed,
        smoothness: projectSettings.smoothness,
        selectedAvatar: projectSettings.selectedAvatar || 0,
      };
    }
    // Then check if we have settings in the project object
    if (project?.settings) {
      return {
        playbackSpeed: project.settings.playbackSpeed,
        smoothness: project.settings.smoothness,
        selectedAvatar: project.settings.selectedAvatar || 0,
      };
    }
    // Default settings
    return {
      playbackSpeed: 1,
      smoothness: 0.5,
      selectedAvatar: 0,
    };
  });

  // Debug log to verify settings are loaded correctly
  useEffect(() => {
    console.log("Current settings:", settings);
  }, [settings]);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  // Load video if project data is available
  useEffect(() => {
    if (project?.videoId && !videoState.video) {
      const loadVideo = async () => {
        try {
          setVideoState((prev) => ({ ...prev, isLoading: true }));
          console.log(`Getting video URL for ID: ${project.videoId}`);
          const videoUrl = await videoService.getVideoUrl(project.videoId);
          console.log(`Received video URL: ${videoUrl.url}`);

          // Create a new video object with the correct ID and URL
          const video = {
            id: project.videoId,
            title: project.videoTitle || project.title,
            url: videoUrl.url,
            videoId: project.videoId,
            duration: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Update video state with the new video object
          setVideoState((prev) => ({
            ...prev,
            video,
            videoTitle: project.videoTitle || project.title,
            isLoading: false,
            error: null,
          }));

          // Apply playback speed after video is loaded
          if (videoRef.current) {
            videoRef.current.playbackRate = settings.playbackSpeed;
          }
        } catch (error) {
          console.error("Error loading video:", error);
          setVideoState((prev) => ({
            ...prev,
            isLoading: false,
            error: "Failed to load video",
          }));
          toast({
            title: "Error",
            description: "Failed to load video. Please try again.",
          });
        }
      };

      loadVideo();
    }
  }, [project?.videoId, toast, settings.playbackSpeed]);

  // Add URL refresh logic
  useEffect(() => {
    let refreshInterval: number;
    let initialLoadTimeout: number;

    const refreshVideoUrl = async () => {
      // Don't refresh if we're already loading or refreshing
      if (isRefreshingUrl || videoState.isLoading) {
        console.log("Skipping URL refresh - already loading or refreshing");
        return;
      }

      // Only refresh if we have a video and it matches the project
      if (!videoState.video?.id || videoState.video.id !== project?.videoId) {
        console.log("Skipping URL refresh - video ID mismatch or no video");
        return;
      }

      try {
        setIsRefreshingUrl(true);
        console.log(`Refreshing video URL for ID: ${videoState.video.id}`);
        const videoUrl = await videoService.getVideoUrl(videoState.video.id);
        console.log(`Received new video URL: ${videoUrl.url}`);

        // Update video state with new URL
        setVideoState((prev) => ({
          ...prev,
          video: prev.video ? { ...prev.video, url: videoUrl.url } : null,
        }));
      } catch (error) {
        console.error("Error refreshing video URL:", error);
      } finally {
        setIsRefreshingUrl(false);
      }
    };

    // Only start refresh cycle if we have a video and it matches the project
    if (videoState.video?.id && videoState.video.id === project?.videoId) {
      // Wait 5 minutes before starting the refresh cycle
      initialLoadTimeout = setTimeout(() => {
        // Initial refresh
        refreshVideoUrl();
        // Then set up regular refresh interval
        refreshInterval = setInterval(refreshVideoUrl, 45 * 60 * 1000);
      }, 5 * 60 * 1000);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      if (initialLoadTimeout) {
        clearTimeout(initialLoadTimeout);
      }
    };
  }, [
    videoState.video?.id,
    project?.videoId,
    isRefreshingUrl,
    videoState.isLoading,
  ]);

  // Update video title
  const updateVideoTitle = async (title: string) => {
    // If title is empty, don't send to backend
    if (!title.trim()) {
      return;
    }

    // If we have a video, update its title in the backend
    if (videoState.video) {
      try {
        await videoService.updateVideoTitle(videoState.video.id, title);
        // Update the current video object with new title
        setVideoState((prev) => ({
          ...prev,
          video: prev.video ? { ...prev.video, title } : null,
          videoTitle: title,
        }));
      } catch (error) {
        console.error("Failed to update video title:", error);
        toast({
          title: "Error",
          description: "Failed to update video title. Please try again.",
        });
        // Revert to previous title on error
        setVideoState((prev) => ({
          ...prev,
          videoTitle: prev.video?.title || "Untitled Video",
        }));
      }
    }
  };

  // Handle title input changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoState((prev) => ({ ...prev, videoTitle: e.target.value }));
  };

  // Handle title input blur
  const handleTitleBlur = () => {
    updateVideoTitle(videoState.videoTitle);
  };

  // Handle title input key press
  const handleTitleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur(); // This will trigger the blur event and save the title
    }
  };

  // Handle video selection from sidebar
  const handleVideoSelect = (video: Video | null) => {
    if (!video) {
      setVideoState({
        video: null,
        videoTitle: project?.videoTitle || project?.title || "Untitled Video",
        currentTime: 0,
        videoDuration: 0,
        isPlaying: false,
        isLoading: false,
        error: null,
      });
      return;
    }

    // Always update video preview when a new video is selected
    setVideoState({
      video,
      videoTitle:
        video.title ||
        project?.videoTitle ||
        project?.title ||
        "Untitled Video",
      currentTime: 0,
      videoDuration: 0,
      isPlaying: false,
      isLoading: false,
      error: null,
    });
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

      // Ignore keyboard shortcuts if user is editing the title input
      if (e.target instanceof HTMLInputElement) return;

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
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!document.fullscreenElement) {
      // Enter fullscreen on wrapper container
      container.requestFullscreen().catch((err) => {
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
      // Apply playback speed when metadata is loaded
      videoRef.current.playbackRate = settings.playbackSpeed;

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

  // Handle export button click
  const handleExport = () => {
    if (!videoState.video) return;

    // Navigate to export page with video data, current settings, and project info
    navigate("/export", {
      state: {
        video: videoState.video,
        videoTitle: videoState.videoTitle,
        settings: {
          playbackSpeed: settings.playbackSpeed,
          smoothness: settings.smoothness,
          selectedAvatar: settings.selectedAvatar,
        },
        project: project || {
          videoId: videoState.video.id,
          title: videoState.videoTitle,
          videoTitle: videoState.videoTitle,
          settings: {
            playbackSpeed: settings.playbackSpeed,
            smoothness: settings.smoothness,
            selectedAvatar: settings.selectedAvatar,
          },
        },
      },
    });
  };

  // Handle back button click
  const handleBack = async () => {
    try {
      // Save any changes to the project
      if (project?._id && videoState.video) {
        const updatedProject = await projectService.updateProject(project._id, {
          title: videoState.videoTitle,
          settings: {
            playbackSpeed: settings.playbackSpeed,
            smoothness: settings.smoothness,
            selectedAvatar: settings.selectedAvatar,
          },
        });

        // Navigate back to home with updated project state
        navigate("/", {
          state: {
            project: {
              ...updatedProject,
              videoId: videoState.video.id,
              videoTitle: videoState.videoTitle,
              settings: {
                playbackSpeed: settings.playbackSpeed,
                smoothness: settings.smoothness,
                selectedAvatar: settings.selectedAvatar,
              },
            },
          },
        });
      } else {
        // If no project, just navigate back
        navigate("/");
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
      });
    }
  };

  return (
    <div
      className="editor-page flex h-screen overflow-hidden text-foreground"
      style={{ backgroundColor: "#1a1a1a" }}
    >
      {/* Mobile Sidebar Toggle */}
      <button
        className="button-menu lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-purple-600 hover:bg-purple-700"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <div
        className="editor-sidebar w-64 h-full text-foreground"
        style={{ backgroundColor: "#413946" }}
      >
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onVideoSelect={handleVideoSelect}
          onProcessing={setIsSidebarProcessing}
          selectedVideoId={videoState.video?.id}
          videoTitle={videoState.videoTitle}
          onBack={handleBack}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div
          className="editor-header p-4 flex justify-between items-center"
          style={{ backgroundColor: "#2c223e" }}
        >
          {/* Empty div for spacing */}
          <div className="w-24" />

          {/* Title Input */}
          <input
            type="text"
            value={videoState.videoTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyPress={handleTitleKeyPress}
            className="editor-title bg-transparent text-center text-xl font-semibold focus:outline-none focus:border-b-2 focus:border-purple-500 px-4 py-1 max-w-md"
            style={{ minWidth: "200px" }}
          />

          {/* Export Button */}
          <div className="w-24 flex justify-end">
            <Button
              className="button-export bg-purple-600 hover:bg-purple-700 text-foreground"
              disabled={!videoState.video || !!videoState.error}
              onClick={handleExport}
            >
              Export
            </Button>
          </div>
        </div>

        {/* Video Preview Area */}
        <div
          className="editor-preview flex-1 p-4 flex flex-col lg:flex-row gap-8 min-h-[350px] overflow-y-auto"
          style={{ backgroundColor: "#2c223e" }}
        >
          {/* Video Preview Components */}
          <VideoPreviewSection
            videoState={videoState}
            setVideoState={setVideoState}
            videoRef={videoRef}
            handleMetadataLoaded={handleMetadataLoaded}
            handleTimeUpdate={handleTimeUpdate}
            handleVideoError={handleVideoError}
            toggleFullscreen={toggleFullscreen}
            isProcessing={isSidebarProcessing}
            smoothness={settings.smoothness}
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
        <div
          style={{ backgroundColor: "#1e1a2b" }}
          className="editor-settings overflow-y-auto"
        >
          <SettingsPanel
            playbackSpeed={settings.playbackSpeed}
            onPlaybackSpeedChange={updatePlaybackSpeed}
            smoothness={settings.smoothness}
            onSmoothnessChange={updateSmoothness}
            sliderClassName="[&>.relative]:bg-card/20 [&_[role=slider]]:bg-card [&_[data-orientation=horizontal]]:bg-purple-500"
          />
        </div>
      </div>
    </div>
  );
}
