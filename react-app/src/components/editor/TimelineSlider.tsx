import { Slider } from "@/components/ui/slider";
import { TimelineSliderProps } from "@/types/video.d";

export function TimelineSlider({
  videoState,
  formatTime,
  calculateSliderValue,
  handleSliderChange,
}: TimelineSliderProps) {
  const { currentTime, videoDuration, video, error } = videoState;

  return (
    <div
      className="px-8 py-4 flex justify-center timeline-container"
      style={{ backgroundColor: "#2c223e" }}
    >
      <div className="w-1/2">
        <div className="flex items-center gap-4">
          <span className="text-sm text-foreground/60">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={calculateSliderValue()}
            onValueChange={handleSliderChange}
            max={100}
            step={1}
            disabled={!video || !!error}
            className="cursor-pointer timeline-slider [&>.relative]:bg-card/20 [&_[role=slider]]:bg-card [&_[data-orientation=horizontal]]:bg-purple-500"
          />
          <span className="text-sm text-foreground/60">
            {formatTime(videoDuration)}
          </span>
        </div>
      </div>
    </div>
  );
}
