import { Button } from '@/components/ui/button';
import { Maximize2 } from 'lucide-react';

interface VideoPreviewProps {
  title: string;
}

export function VideoPreview({ title }: VideoPreviewProps) {
  const handleFullscreen = () => {
    // Implement fullscreen functionality
  };

  return (
    <div className="flex-1 flex flex-col rounded-lg overflow-hidden border border-[#3a3a3a] shadow-lg text-white" style={{ backgroundColor: '#2c223e' }}>
      <div className="flex justify-between items-center px-4 py-3" style={{ backgroundColor: '#3a3a3a' }}>
        <h3 className="text-base font-medium text-white">{title}</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFullscreen}
          className="text-white hover:text-white hover:bg-white/10 rounded-lg"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full aspect-video rounded-lg flex items-center justify-center border border-[#3a3a3a]" style={{ backgroundColor: '#1e1a2b' }}>
          <span className="text-sm text-white/60">Video Preview</span>
        </div>
      </div>
    </div>
  );
} 