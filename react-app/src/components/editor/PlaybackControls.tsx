import { Button } from "@/components/ui/button";
import { AvatarPicker } from "@/components/editor/AvatarPicker";
import { Video } from "@/types/video.d";

interface PlaybackControlsProps {
  videoState: {
    video: Video | null;
    error: string | null;
    isPlaying: boolean;
  };
  togglePlayPause: () => void;
  skipBackward: () => void;
  skipForward: () => void;
  selectedAvatar: number;
  updateSelectedAvatar: (index: number) => void;
}

export function PlaybackControls({
  videoState,
  togglePlayPause,
  skipBackward,
  skipForward,
  selectedAvatar,
  updateSelectedAvatar,
}: PlaybackControlsProps) {
  const { video, error, isPlaying } = videoState;

  return (
    <div
      className="px-4 video-controls-container"
      style={{ backgroundColor: "#2c223e" }}
    >
      <div className="flex items-center justify-between max-w-full px-4 py-4">
        <div className="w-12" />

        <div className="flex items-center justify-center gap-8">
          <Button
            variant="outline"
            size="icon"
            className="video-control-button rounded-full text-foreground border-white/20 hover:bg-card/10"
            onClick={skipBackward}
            disabled={!video || !!error}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="play-pause-button w-16 h-16 rounded-full text-foreground border-white/20 hover:bg-card/10"
            onClick={togglePlayPause}
            disabled={!video || !!error}
          >
            {isPlaying ? (
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="video-control-button rounded-full text-foreground border-white/20 hover:bg-card/10"
            onClick={skipForward}
            disabled={!video || !!error}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
        </div>

        <div className="flex items-center w-12">
          <AvatarPicker
            selected={selectedAvatar}
            onSelect={updateSelectedAvatar}
          />
        </div>
      </div>
    </div>
  );
}
