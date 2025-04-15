import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/editor/Sidebar';
import { VideoPreview } from '@/components/editor/VideoPreview';
import { SettingsPanel } from '@/components/editor/SettingsPanel';
import { AvatarPicker } from '@/components/editor/AvatarPicker';
import { Menu, Upload } from 'lucide-react';

export default function VideoEditor() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [smoothness, setSmoothness] = useState(0.5);
  const [selectedAvatar, setSelectedAvatar] = useState(0);

  return (
    <div className="flex h-screen overflow-hidden text-white" style={{ backgroundColor: '#1a1a1a' }}>
      {/* Mobile Sidebar Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-purple-600 hover:bg-purple-700"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <div className="w-64 h-full text-white" style={{ backgroundColor: '#413946' }}>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="p-4 flex justify-end" style={{ backgroundColor: '#2c223e' }}>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            Export
          </Button>
        </div>

        {/* Video Preview Area */}
        <div className="flex-1 p-4 flex flex-col lg:flex-row gap-8" style={{ backgroundColor: '#2c223e' }}>
          <div className="flex-1 flex flex-col">
            <VideoPreview title="Skeleton Extract" />
          </div>
          <div className="flex-1 flex flex-col">
            <VideoPreview title="Preview" />
          </div>
        </div>

        {/* Timeline and Controls */}
        <div className="px-8 py-4" style={{ backgroundColor: '#2c223e' }}>
          {/* Timeline */}
          <div className="w-full h-1 bg-[#3a3a3a] rounded-full mb-4" />
          
          {/* Playback Controls and Avatar Container */}
          <div className="relative flex items-center">
            {/* Playback Controls - Centered */}
            <div className="w-full flex items-center justify-center gap-8">
              <Button variant="outline" size="icon" className="rounded-full text-white border-white/20 hover:bg-white/10">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <Button variant="outline" size="icon" className="w-16 h-16 rounded-full text-white border-white/20 hover:bg-white/10">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Button>
              <Button variant="outline" size="icon" className="rounded-full text-white border-white/20 hover:bg-white/10">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>

            {/* Avatar Picker - Absolute positioned on the right */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <AvatarPicker selected={selectedAvatar} onSelect={setSelectedAvatar} />
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        <div style={{ backgroundColor: '#1e1a2b' }}>
          <SettingsPanel
            playbackSpeed={playbackSpeed}
            onPlaybackSpeedChange={setPlaybackSpeed}
            smoothness={smoothness}
            onSmoothnessChange={setSmoothness}
          />
        </div>
      </div>
    </div>
  );
} 