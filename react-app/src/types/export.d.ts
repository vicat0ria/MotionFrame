import { Video, Project, EditorSettings } from "./video.d";

export type ExportType = "skeleton" | "preview";
export type SkeletonFileType = "json" | "bvh" | "fbx" | "csv";
export type VideoFileType = "mp4" | "mov" | "avi" | "webm";
export type FileType = SkeletonFileType | VideoFileType;

export interface FileOption {
  value: FileType;
  label: string;
}

export interface ExportLocationState {
  video: Video;
  videoTitle: string;
  project?: Omit<Project, "description" | "timestamp" | "userId" | "status">;
  settings?: EditorSettings;
}

export interface ExportProjectData extends Omit<Project, "_id" | "id"> {
  exportType: ExportType;
  fileType: FileType;
}
