// Type definitions for video-related components

export interface Video {
  id: string;
  videoId?: string;
  compressedVideoId?: string;
  url: string;
  title?: string;
  duration?: number;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoUrlResponse {
  url: string;
}

export interface VideoState {
  video: Video | null;
  videoTitle: string;
  videoDuration: number;
  currentTime: number;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface EditorSettings {
  playbackSpeed: number;
  smoothness: number;
  selectedAvatar: number;
}

export interface VideoEditorLocationState {
  project?: Project;
  settings?: EditorSettings;
}

export interface VideoPreviewSectionProps {
  videoState: VideoState;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  handleMetadataLoaded: () => void;
  handleTimeUpdate: () => void;
  handleVideoError: () => void;
  toggleFullscreen: () => void;
}

export interface TimelineSliderProps {
  videoState: VideoState;
  formatTime: (time: number) => string;
  calculateSliderValue: () => number[];
  handleSliderChange: (value: number[]) => void;
}

export interface PlaybackControlsProps {
  videoState: VideoState;
  togglePlayPause: () => void;
  skipBackward: () => void;
  skipForward: () => void;
  selectedAvatar: number;
  updateSelectedAvatar: (index: number) => void;
}

export interface Project {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  videoId: string;
  exportType: string;
  fileType: string;
  timestamp: string;
  badge: string;
  videoTitle: string;
  userId: string;
  status?: "pending" | "processing" | "completed" | "failed";
  s3ExportKey?: string;
  settings?: {
    playbackSpeed: number;
    smoothness: number;
    selectedAvatar?: number;
  };
}

export interface Template {
  id: number;
  title: string;
  description: string;
  image: string;
  badge: string;
}
