import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

import { Video, VideoUrlResponse } from "@/types/video.d";

interface UploadResponse {
  message: string;
  video: Video;
}

interface VideosResponse {
  videos: Video[];
}

interface StatusResponse {
  status: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export const videoService = {
  // Upload a video file
  async uploadVideo(file: File): Promise<Video> {
    console.log(
      `VideoService: Starting upload for ${file.name}, size: ${(
        file.size /
        (1024 * 1024)
      ).toFixed(2)}MB`
    );

    try {
      const formData = new FormData();
      formData.append("video", file);

      const response = await axios.post<UploadResponse>(
        `${API_URL}/videos/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      console.log("Upload successful:", response.data);
      const video = response.data.video;
      const urlResponse = await this.getVideoUrl(video.id);
      return {
        ...video,
        url: urlResponse.url,
      };
    } catch (error) {
      // Log error details safely without type checking
      console.error("Upload failed:", error);

      // Re-throw to be handled by the caller
      throw error;
    }
  },

  // Get the user's current video (only one allowed)
  async getUserVideo(): Promise<Video | null> {
    const response = await axios.get<VideosResponse>(`${API_URL}/videos/user`, {
      withCredentials: true,
    });
    const videos = response.data.videos.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (videos.length > 0) {
      const video = videos[0];
      const urlResponse = await this.getVideoUrl(video.id);
      return {
        ...video,
        url: urlResponse.url,
      };
    }
    return null;
  },

  // Get video URL for playback
  async getVideoUrl(videoId: string): Promise<VideoUrlResponse> {
    const response = await axios.get<{ url: string }>(
      `${API_URL}/videos/${videoId}/url`,
      {
        withCredentials: true,
      }
    );
    return {
      url: response.data.url,
    };
  },

  // Get thumbnail URL
  getThumbnailUrl(videoId: string): string {
    return `${API_URL}/videos/${videoId}/thumbnail`;
  },

  // Delete a video
  async deleteVideo(videoId: string): Promise<void> {
    await axios.delete(`${API_URL}/videos/${videoId}`, {
      withCredentials: true,
    });
  },

  // Get video processing status
  async getProcessingStatus(
    videoId: string
  ): Promise<{ status: string; progress: number }> {
    const response = await axios.get<StatusResponse>(
      `${API_URL}/videos/${videoId}/status`,
      {
        withCredentials: true,
      }
    );

    return {
      status: response.data.status,
      progress: response.data.progress,
    };
  },
};
