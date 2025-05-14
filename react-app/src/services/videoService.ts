import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

import { Video, VideoUrlResponse } from "@/types/video.d";

interface VideosResponse {
  videos: Video[];
}

interface StatusResponse {
  status: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

// Define types for the landmarks data
export interface Landmark {
  id: number;
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface VideoMetadata {
  original_width: number;
  original_height: number;
  frame_count: number;
  fps: number;
}

export interface LandmarkResponse {
  metadata?: VideoMetadata;
  landmarks?: Landmark[][];
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

      const response = await axios.post<{ videoId: string }>(
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
      const videoId = response.data.videoId;
      const urlResponse = await this.getVideoUrl(videoId);
      const now = new Date();
      return {
        id: videoId,
        videoId: videoId,
        title: file.name,
        url: urlResponse.url,
        duration: 0,
        createdAt: now,
        updatedAt: now,
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
    try {
      const response = await axios.get<{ url: string }>(
        `${API_URL}/videos/${videoId}/url`,
        {
          withCredentials: true,
        }
      );
      return {
        url: response.data.url,
      };
    } catch (error) {
      console.error("Error getting video URL:", error);
      throw error;
    }
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

  // Update video title
  async updateVideoTitle(videoId: string, title: string): Promise<void> {
    try {
      await axios.patch(
        `${API_URL}/videos/${videoId}/title`,
        { title },
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Error updating video title:", error);
      throw error;
    }
  },

  // Get video processing status
  async getProcessingStatus(
    videoId: string
  ): Promise<{ status: string; progress: number }> {
    try {
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
    } catch (error) {
      console.error("Error getting video status:", error);
      // If we can't get the status, assume it's still processing
      return {
        status: "processing",
        progress: 0,
      };
    }
  },

  // Get per-frame landmarks JSON
  async getLandmarks(
    videoId: string
  ): Promise<LandmarkResponse | Landmark[][]> {
    try {
      const response = await axios.get<LandmarkResponse | Landmark[][]>(
        `${API_URL}/videos/${videoId}/landmarks`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching landmarks:", error);
      throw error;
    }
  },
};
