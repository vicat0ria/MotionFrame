import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useState } from 'react';

export function PlaybackControls() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-2xl mx-auto px-4">
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white hover:bg-[#3a3a3a] rounded-lg"
          onClick={() => {}}
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white hover:bg-[#3a3a3a] rounded-lg w-12 h-12"
          onClick={handlePlayPause}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white hover:bg-[#3a3a3a] rounded-lg"
          onClick={() => {}}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-400">
        <span>0:00</span>
        <Slider
          defaultValue={[0]}
          max={100}
          step={1}
          value={[currentTime]}
          onValueChange={handleTimeChange}
          className="flex-1"
        />
        <span>2:30</span>
      </div>
    </div>
  );
} 