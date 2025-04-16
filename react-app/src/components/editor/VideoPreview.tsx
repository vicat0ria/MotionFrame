import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface VideoPreviewProps {
  title: string;
  placeholderImage?: string;
}

export function VideoPreview({ title, placeholderImage }: VideoPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col rounded-lg overflow-hidden border border-[#3a3a3a] shadow-lg text-white" style={{ backgroundColor: '#2c223e' }}>
      <div className="flex justify-between items-center px-4 py-3" style={{ backgroundColor: '#3a3a3a' }}>
        <h3 className="text-base font-medium text-white">{title}</h3>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div 
          ref={containerRef}
          className="relative w-[85%] mx-auto rounded-lg border border-[#3a3a3a] overflow-hidden" 
          style={{ backgroundColor: '#1e1a2b', aspectRatio: '16/9' }}
        >
          {placeholderImage ? (
            <img 
              src={placeholderImage} 
              alt={title} 
              className={`w-full h-full object-cover ${isFullscreen ? 'object-contain' : ''}`}
            />
          ) : (
            <span className="flex items-center justify-center h-full text-sm text-white/60">Video Preview</span>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFullscreen}
            className="absolute bottom-2 right-2 text-white hover:text-white hover:bg-black/40 rounded-lg"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 