import React from "react";

interface VideoPreviewProps {
  videoUrl: string;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ videoUrl }) => {
  return (
    <div
      className="flex-1 flex flex-col rounded-lg overflow-hidden border border-[#3a3a3a] shadow-lg text-foreground video-preview-container"
      style={{ backgroundColor: "rgb(44, 34, 62)" }}
    >
      <div
        className="flex justify-between items-center px-4 py-3 video-preview-header"
        style={{ backgroundColor: "rgb(58, 58, 58)" }}
      >
        <h3 className="text-base font-medium text-foreground">
          Skeleton Extract
        </h3>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className="relative mx-auto rounded-lg border border-[#3a3a3a] overflow-hidden video-container"
          style={{
            backgroundColor: "rgb(30, 26, 43)",
            aspectRatio: "16/9",
            width: "80%",
          }}
        >
          <video
            src={videoUrl}
            playsInline
            className="w-full h-full object-contain"
          ></video>
          <div
            className="absolute right-4 bottom-4 bg-background/50 hover:bg-background/70 rounded-full p-2 cursor-pointer transition-colors fullscreen-button"
            title="Toggle fullscreen"
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
              className="lucide lucide-maximize2 lucide-maximize-2 w-5 h-5 text-foreground"
            >
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" x2="14" y1="3" y2="10" />
              <line x1="3" x2="10" y1="21" y2="14" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
