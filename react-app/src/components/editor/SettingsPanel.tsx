import { Slider } from "@/components/ui/slider";

interface SettingsPanelProps {
  playbackSpeed: number;
  smoothness: number;
  onPlaybackSpeedChange: (value: number) => void;
  onSmoothnessChange: (value: number) => void;
  sliderClassName?: string;
}

const sliderClassName =
  "settings-slider relative flex w-full touch-none select-none items-center mb-6";

export function SettingsPanel({
  playbackSpeed,
  smoothness,
  onPlaybackSpeedChange,
  onSmoothnessChange,
}: SettingsPanelProps) {
  const handlePlaybackSpeedMinus = () =>
    onPlaybackSpeedChange(Math.max(0.25, playbackSpeed - 0.25));
  const handlePlaybackSpeedPlus = () =>
    onPlaybackSpeedChange(Math.min(2.0, playbackSpeed + 0.25));
  const handleSmoothnessMinus = () =>
    onSmoothnessChange(Math.max(0, smoothness - 0.25));
  const handleSmoothnessPlus = () =>
    onSmoothnessChange(Math.min(1.0, smoothness + 0.25));

  return (
    <div className="editor-settings overflow-y-auto">
      <div className="p-6 border-t border-[#3a3a3a] text-foreground">
        <h3 className="text-lg font-semibold mb-6 text-foreground">
          Adjust Settings
        </h3>
        <div className="flex justify-center gap-16">
          <div className="settings-card w-[280px] p-4 rounded-lg border border-[#3a3a3a] shadow-md">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-medium text-foreground">
                Playback Speed
              </label>
              <div className="flex items-center gap-2">
                <button
                  className="settings-control-button inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border bg-background shadow-sm hover:text-accent-foreground rounded-full h-8 w-8 text-foreground border-white/20 hover:bg-card/10"
                  onClick={handlePlaybackSpeedMinus}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-minus h-4 w-4"
                  >
                    <path d="M5 12h14" />
                  </svg>
                </button>
                <span className="settings-value w-12 text-center text-foreground">
                  {playbackSpeed}x
                </span>
                <button
                  className="settings-control-button inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border bg-background shadow-sm hover:text-accent-foreground rounded-full h-8 w-8 text-foreground border-white/20 hover:bg-card/10"
                  onClick={handlePlaybackSpeedPlus}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-plus h-4 w-4"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                </button>
              </div>
            </div>
            <span className={sliderClassName}>
              <Slider
                value={[playbackSpeed]}
                min={0.25}
                max={2}
                step={0.25}
                onValueChange={([value]) => onPlaybackSpeedChange(value)}
              />
            </span>
            <div className="grid grid-cols-5 gap-2">
              {[0.25, 0.5, 1.0, 1.5, 2.0].map((speed) => (
                <button
                  key={speed}
                  onClick={() => onPlaybackSpeedChange(speed)}
                  className={`speed-button inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 px-3 text-xs rounded-full w-full ${
                    playbackSpeed === speed
                      ? "active bg-purple-500 hover:bg-purple-600 text-foreground"
                      : "border bg-background shadow-sm hover:text-accent-foreground text-foreground border-white/20 hover:bg-card/10"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
          <div
            className="settings-divider shrink-0 h-full w-[1px] bg-[#3a3a3a]"
            role="none"
          />
          <div className="settings-card w-[280px] p-4 rounded-lg border border-[#3a3a3a] shadow-md">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-medium text-foreground">
                Smoothness
              </label>
              <div className="flex items-center gap-2">
                <button
                  className="settings-control-button inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border bg-background shadow-sm hover:text-accent-foreground rounded-full h-8 w-8 text-foreground border-white/20 hover:bg-card/10"
                  onClick={handleSmoothnessMinus}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-minus h-4 w-4"
                  >
                    <path d="M5 12h14" />
                  </svg>
                </button>
                <span className="settings-value w-12 text-center text-foreground">
                  {smoothness.toFixed(2)}
                </span>
                <button
                  className="settings-control-button inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border bg-background shadow-sm hover:text-accent-foreground rounded-full h-8 w-8 text-foreground border-white/20 hover:bg-card/10"
                  onClick={handleSmoothnessPlus}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-plus h-4 w-4"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                </button>
              </div>
            </div>
            <span className={sliderClassName}>
              <Slider
                value={[smoothness]}
                min={0}
                max={1}
                step={0.25}
                onValueChange={([value]) => onSmoothnessChange(value)}
              />
            </span>
            <div className="grid grid-cols-5 gap-2">
              {[0, 0.25, 0.5, 0.75, 1.0].map((value) => (
                <button
                  key={value}
                  onClick={() => onSmoothnessChange(value)}
                  className={`smoothness-button inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 px-3 text-xs rounded-full w-full ${
                    smoothness === value
                      ? "active bg-purple-500 hover:bg-purple-600 text-foreground"
                      : "border bg-background shadow-sm hover:text-accent-foreground text-foreground border-white/20 hover:bg-card/10"
                  }`}
                >
                  {value.toFixed(2)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
