import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus } from 'lucide-react';

interface SettingsPanelProps {
  playbackSpeed: number;
  onPlaybackSpeedChange: (value: number) => void;
  smoothness: number;
  onSmoothnessChange: (value: number) => void;
}

const speedPresets = [0.25, 0.5, 1.0, 1.5, 2.0];
const smoothnessPresets = [0.0, 0.25, 0.5, 0.75, 1.0];

export function SettingsPanel({
  playbackSpeed,
  onPlaybackSpeedChange,
  smoothness,
  onSmoothnessChange,
}: SettingsPanelProps) {
  return (
    <div className="p-6 border-t border-[#3a3a3a] text-white" style={{ backgroundColor: '#1e1a2b' }}>
      <h3 className="text-lg font-semibold mb-6 text-white">Adjust Settings</h3>
      
      <div className="flex justify-center gap-16">
        {/* Playback Speed */}
        <div className="w-[280px] p-4 rounded-lg border border-[#3a3a3a] shadow-md" style={{ backgroundColor: '#2c223e' }}>
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-medium text-white">Playback Speed</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onPlaybackSpeedChange(Math.max(0.25, playbackSpeed - 0.25))}
                className="rounded-full h-8 w-8 text-white border-white/20 hover:bg-white/10"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center text-white">{playbackSpeed}x</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onPlaybackSpeedChange(Math.min(2.0, playbackSpeed + 0.25))}
                className="rounded-full h-8 w-8 text-white border-white/20 hover:bg-white/10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Slider
            value={[playbackSpeed]}
            min={0.25}
            max={2.0}
            step={0.25}
            onValueChange={([value]) => onPlaybackSpeedChange(value)}
            className="mb-6"
          />
          
          <div className="grid grid-cols-5 gap-2">
            {speedPresets.map((preset) => (
              <Button
                key={preset}
                variant={playbackSpeed === preset ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPlaybackSpeedChange(preset)}
                className={`rounded-full w-full ${
                  playbackSpeed === preset 
                    ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                    : 'text-white border-white/20 hover:bg-white/10'
                }`}
              >
                {preset}x
              </Button>
            ))}
          </div>
        </div>

        <Separator orientation="vertical" className="bg-[#3a3a3a]" />

        {/* Smoothness */}
        <div className="w-[280px] p-4 rounded-lg border border-[#3a3a3a] shadow-md" style={{ backgroundColor: '#2c223e' }}>
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-medium text-white">Smoothness</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onSmoothnessChange(Math.max(0, smoothness - 0.25))}
                className="rounded-full h-8 w-8 text-white border-white/20 hover:bg-white/10"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center text-white">{smoothness.toFixed(2)}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onSmoothnessChange(Math.min(1.0, smoothness + 0.25))}
                className="rounded-full h-8 w-8 text-white border-white/20 hover:bg-white/10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Slider
            value={[smoothness]}
            min={0}
            max={1.0}
            step={0.25}
            onValueChange={([value]) => onSmoothnessChange(value)}
            className="mb-6"
          />
          
          <div className="grid grid-cols-5 gap-2">
            {smoothnessPresets.map((preset) => (
              <Button
                key={preset}
                variant={smoothness === preset ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSmoothnessChange(preset)}
                className={`rounded-full w-full ${
                  smoothness === preset 
                    ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                    : 'text-white border-white/20 hover:bg-white/10'
                }`}
              >
                {preset.toFixed(2)}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 