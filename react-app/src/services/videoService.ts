import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

import { Video } from "@/types/video.d";

interface UploadResponse {
  videoId: string;
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

    const formData = new FormData();
    formData.append("video", file);

    const response = await axios.post<UploadResponse>(
      `${API_URL}/videos/upload`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      }
    );
    console.log("Upload successful:", response.data);
    const analysisId: string = response.data.videoId;
    return {
      id: analysisId,
      url: "",
      title: file.name,
      duration: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  // Get the user's most recent video
  async getUserVideo(): Promise<Video | null> {
    const response = await axios.get<VideosResponse>(`${API_URL}/videos/user`, {
      withCredentials: true,
    });
    const videos = response.data.videos.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return videos.length > 0 ? videos[0] : null;
  },

  // Get video URL for playback (MP4 streamed from backend)
  getVideoUrl(key: string): string {
    return `${API_URL}/videos/${key}`;
  },

  // Thumbnail URL (served by backend proxy)
  getThumbnailUrl(videoId: string): string {
    return `${API_URL}/videos/${videoId}/thumbnail`;
  },

  // Delete a video
  async deleteVideo(videoId: string): Promise<void> {
    await axios.delete(`${API_URL}/videos/${videoId}`, {
      withCredentials: true,
    });
  },

  // Get processing status
  async getProcessingStatus(videoId: string) {
    const { data } = await axios.get<StatusResponse>(
      `${API_URL}/videos/${videoId}/status`,
      { withCredentials: true }
    );
    return { status: data.status, progress: data.progress };
  },
};
