import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/editor/Sidebar';
import { VideoPreview } from '@/components/editor/VideoPreview';
import { SettingsPanel } from '@/components/editor/SettingsPanel';
import { AvatarPicker } from '@/components/editor/AvatarPicker';
import { Menu, Upload } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

// Import placeholder images
import skeletonPlaceholder from '@/assets/Skeleton-Extract-Placeholder.png';
import previewPlaceholder from '@/assets/Preview-Placeholder.png';

export default function VideoEditor() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [smoothness, setSmoothness] = useState(0.5);
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [videoTitle, setVideoTitle] = useState("Untitled Video");
  const [videoProgress, setVideoProgress] = useState([0]);

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
        <div className="p-4 flex justify-between items-center" style={{ backgroundColor: '#2c223e' }}>
          {/* Empty div for spacing */}
          <div className="w-24" />
          
          {/* Title Input */}
          <input
            type="text"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            className="bg-transparent text-center text-xl font-semibold focus:outline-none focus:border-b-2 focus:border-purple-500 px-4 py-1 max-w-md"
            style={{ minWidth: '200px' }}
          />

          {/* Export Button */}
          <div className="w-24 flex justify-end">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Export
            </Button>
          </div>
        </div>

        {/* Video Preview Area */}
        <div className="flex-1 p-4 flex flex-col lg:flex-row gap-8" style={{ backgroundColor: '#2c223e' }}>
          <div className="flex-1 flex flex-col">
            <VideoPreview title="Skeleton Extract" placeholderImage={skeletonPlaceholder} />
          </div>
          <div className="flex-1 flex flex-col">
            <VideoPreview title="Preview" placeholderImage={previewPlaceholder} />
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="px-8 py-4 flex justify-center" style={{ backgroundColor: '#2c223e' }}>
          <div className="w-1/2">
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/60">0:00</span>
              <Slider
                value={videoProgress}
                onValueChange={setVideoProgress}
                max={100}
                step={1}
                className="cursor-pointer [&>.relative]:bg-white/20 [&_[role=slider]]:bg-white [&_[data-orientation=horizontal]]:bg-purple-500"
              />
              <span className="text-sm text-white/60">1:00</span>
            </div>
          </div>
        </div>

        {/* Timeline and Controls */}
        <div className="px-4" style={{ backgroundColor: '#2c223e' }}>
          {/* Playback Controls and Avatar Container */}
          <div className="flex items-center justify-between max-w-full px-4 py-4">
            {/* Empty space to balance avatar */}
            <div className="w-12" />

            {/* Playback Controls - Centered */}
            <div className="flex items-center justify-center gap-8">
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

            {/* Avatar Picker */}
            <div className="flex items-center w-12">
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
            sliderClassName="[&>.relative]:bg-white/20 [&_[role=slider]]:bg-white [&_[data-orientation=horizontal]]:bg-purple-500"
          />
        </div>
      </div>
    </div>
  );
} 