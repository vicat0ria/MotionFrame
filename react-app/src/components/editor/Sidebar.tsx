import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <div
      className={`fixed lg:static lg:block w-64 bg-[#413946] h-screen transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="p-4">
        <Button className="w-full bg-green-600 hover:bg-green-700 mb-4">
          <Upload className="mr-2 h-4 w-4" />
          Import Media
        </Button>

        <h2 className="text-lg font-semibold mb-4 text-purple-400">Media</h2>
        
        <div className="space-y-4">
          {/* Mock Media Items */}
          <div className="bg-[#3a3a3a] rounded-lg p-2">
            <div className="aspect-video bg-[#4a4a4a] rounded mb-2" />
            <p className="text-sm truncate">Sample Video 1.mp4</p>
          </div>
          
          <div className="bg-[#3a3a3a] rounded-lg p-2">
            <div className="aspect-video bg-[#4a4a4a] rounded mb-2" />
            <p className="text-sm truncate">Sample Video 2.mp4</p>
          </div>
        </div>
      </div>
    </div>
  );
} 