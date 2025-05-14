import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ExportType,
  FileType,
  FileOption,
  ExportLocationState,
  ExportProjectData,
} from "@/types/export.d";
import { useToast } from "@/components/ui/use-toast";
import { authService } from "@/services/authService";
import { projectService } from "@/services/projectService";
import { videoService } from "@/services/videoService";
import routes from "@/routes";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: no types for json-2-csv
import * as json2csv from "json-2-csv";

export default function Export() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { video, videoTitle, settings, project } =
    location.state as ExportLocationState;
  const [exportType, setExportType] = useState<ExportType>("skeleton");
  const [fileType, setFileType] = useState<FileType>("json");
  const [projectTitle, setProjectTitle] = useState<string>(
    project?.title || videoTitle || "Untitled Project"
  );
  const [backHover, setBackHover] = useState(false);

  const handleExport = async () => {
    try {
      if (exportType === "skeleton") {
        const response = await videoService.getLandmarks(video.id);
        const landmarksList = Array.isArray(response)
          ? response
          : response.landmarks || [];
        if (fileType === "json") {
          const data = JSON.stringify(landmarksList, null, 2);
          const blob = new Blob([data], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${projectTitle || videoTitle}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } else if (fileType === "csv") {
          // Convert JSON landmark array to CSV rows
          const rows = landmarksList.flatMap((frame, frameIndex) =>
            frame.map((lm) => ({
              frame: frameIndex,
              id: lm.id,
              x: lm.x,
              y: lm.y,
              z: lm.z,
              visibility: lm.visibility,
            }))
          );
          const csv = await json2csv.json2csv(rows);
          const blobCsv = new Blob([csv], {
            type: "text/csv;charset=utf-8;",
          });
          const urlCsv = URL.createObjectURL(blobCsv);
          const linkCsv = document.createElement("a");
          linkCsv.href = urlCsv;
          linkCsv.download = `${projectTitle || videoTitle}.csv`;
          document.body.appendChild(linkCsv);
          linkCsv.click();
          document.body.removeChild(linkCsv);
          URL.revokeObjectURL(urlCsv);
        } else if (fileType === "bvh") {
          // Convert landmarks to BVH format
          const meta = Array.isArray(response) ? undefined : response.metadata;
          const fps = meta?.fps || 30;
          const frameTime = 1 / fps;
          // Define skeleton joint IDs and connections
          const JOINT_IDS = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
          const CONNECTIONS: [number, number][] = [
            [0, 11],
            [0, 12],
            [11, 13],
            [13, 15],
            [12, 14],
            [14, 16],
            [11, 23],
            [12, 24],
            [23, 25],
            [25, 27],
            [24, 26],
            [26, 28],
          ];
          // Build children map
          const childrenMap = new Map<number, number[]>();
          JOINT_IDS.forEach((id) => childrenMap.set(id, []));
          CONNECTIONS.forEach(([p, c]) => childrenMap.get(p)?.push(c));
          // Determine channel order via DFS
          const channelOrder: number[] = [];
          const ROOT = 0;
          function dfs(id: number) {
            channelOrder.push(id);
            (childrenMap.get(id) || []).forEach(dfs);
          }
          dfs(ROOT);
          // Build BVH hierarchy string
          let bvh = "HIERARCHY\n";
          function buildNode(id: number, indent: number) {
            const pad = " ".repeat(indent);
            const name = `J${id}`;
            if (indent === 0) {
              bvh += `ROOT ${name}\n${pad}{\n`;
              bvh += `${pad}  OFFSET 0 0 0\n`;
            } else {
              const parentEntry = CONNECTIONS.find(([, c]) => c === id);
              const parentId = parentEntry ? parentEntry[0] : ROOT;
              const lmParent = landmarksList[0].find(
                (lm) => lm.id === parentId
              ) || { x: 0, y: 0, z: 0 };
              const lm = landmarksList[0].find((lm) => lm.id === id) || {
                x: 0,
                y: 0,
                z: 0,
              };
              const dx = (lm.x - lmParent.x).toFixed(6);
              const dy = (lm.y - lmParent.y).toFixed(6);
              const dz = (lm.z - lmParent.z).toFixed(6);
              bvh += `${pad}JOINT ${name}\n${pad}{\n`;
              bvh += `${pad}  OFFSET ${dx} ${dy} ${dz}\n`;
            }
            bvh += `${pad}  CHANNELS 3 Xposition Yposition Zposition\n`;
            const children = childrenMap.get(id) || [];
            if (children.length) {
              children.forEach((childId) => buildNode(childId, indent + 2));
            } else {
              bvh += `${pad}  End Site\n${pad}  {\n${pad}    OFFSET 0 0 0\n${pad}  }\n`;
            }
            bvh += `${pad}}\n`;
          }
          buildNode(ROOT, 0);
          // Add motion section
          const frameCount = landmarksList.length;
          bvh += `MOTION\nFrames: ${frameCount}\nFrame Time: ${frameTime}\n`;
          landmarksList.forEach((frame) => {
            const values = channelOrder.flatMap((id) => {
              const lm = frame.find((lm) => lm.id === id) || {
                x: 0,
                y: 0,
                z: 0,
              };
              return [lm.x.toFixed(6), lm.y.toFixed(6), lm.z.toFixed(6)];
            });
            bvh += values.join(" ") + "\n";
          });
          // Trigger BVH download
          const blobBvh = new Blob([bvh], { type: "application/octet-stream" });
          const urlBvh = URL.createObjectURL(blobBvh);
          const linkBvh = document.createElement("a");
          linkBvh.href = urlBvh;
          linkBvh.download = `${projectTitle || videoTitle}.bvh`;
          document.body.appendChild(linkBvh);
          linkBvh.click();
          document.body.removeChild(linkBvh);
          URL.revokeObjectURL(urlBvh);
        } else if (fileType === "fbx") {
          // Download JSON as .fbx for user processing
          const data = JSON.stringify(landmarksList, null, 2);
          const blobFbx = new Blob([data], {
            type: "application/octet-stream",
          });
          const urlFbx = URL.createObjectURL(blobFbx);
          const linkFbx = document.createElement("a");
          linkFbx.href = urlFbx;
          linkFbx.download = `${projectTitle || videoTitle}.fbx`;
          document.body.appendChild(linkFbx);
          linkFbx.click();
          document.body.removeChild(linkFbx);
          URL.revokeObjectURL(urlFbx);
        } else {
          toast({
            title: "Not implemented",
            description: `Export for ${fileType} not implemented yet`,
          });
        }
      }
      const userId = await authService.getCurrentUserId();
      if (!userId) {
        toast({
          title: "Error",
          description: "You must be logged in to export projects",
        });
        return;
      }

      // Create project with video settings
      const projectData: ExportProjectData = {
        title: projectTitle,
        description: `${exportType} export in ${fileType} format`,
        videoId: video.id,
        exportType: exportType,
        fileType: fileType,
        badge: exportType === "skeleton" ? "Skeleton" : "Video",
        videoTitle: videoTitle,
        userId: userId,
        status: "pending",
        timestamp: new Date().toISOString(),
        settings: {
          playbackSpeed: settings?.playbackSpeed || 1,
          smoothness: settings?.smoothness || 0.5,
          selectedAvatar: settings?.selectedAvatar || 0,
        },
      };

      console.log("Creating project with settings:", projectData.settings);

      const createdProject = await projectService.createProject(projectData);
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      navigate("/", {
        state: {
          project: {
            ...createdProject,
            videoId: video.id,
            videoTitle: videoTitle,
            settings: projectData.settings,
          },
        },
      });
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project",
      });
    }
  };

  const skeletonOptions: FileOption[] = [
    { value: "json", label: ".json" },
    { value: "bvh", label: ".bvh" },
    { value: "fbx", label: ".fbx" },
    { value: "csv", label: ".csv" },
  ] as const;

  const videoOptions: FileOption[] = [
    { value: "mp4", label: ".mp4" },
    { value: "mov", label: ".mov" },
    { value: "avi", label: ".avi" },
    { value: "webm", label: ".webm" },
  ] as const;

  const currentOptions =
    exportType === "skeleton" ? skeletonOptions : videoOptions;

  const handleBackToEditor = () => {
    navigate(routes.videoEditor.replace("/:id?", ""), {
      state: {
        video,
        videoTitle,
        settings,
        project: project || {
          videoId: video.id,
          title: videoTitle,
          videoTitle: videoTitle,
          settings,
        },
      },
    });
  };

  return (
    <div
      className="export-page"
      style={{
        minHeight: "100vh",
        background: "#2D233B",
        color: "#fff",
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        padding: "40px 0 40px 100px",
        boxSizing: "border-box",
      }}
    >
      {/* Left Section */}
      <div
        className="export-form"
        style={{ width: 504, marginRight: 80, minWidth: 504 }}
      >
        <h1
          className="page-title"
          style={{ fontSize: 48, fontWeight: 700, marginBottom: 32 }}
        >
          Export
        </h1>
        <div style={{ marginBottom: 32 }}>
          <label
            className="form-label"
            htmlFor="project-title"
            style={{
              fontSize: 24,
              fontWeight: 600,
              marginBottom: 16,
              display: "block",
            }}
          >
            Project Title
          </label>
          <input
            id="project-title"
            className="form-input"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            style={{
              background: "#39304A",
              color: "#fff",
              border: "none",
              fontSize: 20,
              padding: "16px 20px",
              borderRadius: 8,
              marginTop: 8,
              marginBottom: 0,
            }}
          />
        </div>
        <div style={{ marginBottom: 32 }}>
          <div
            className="form-label"
            style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}
          >
            Select Export
          </div>
          <div
            className="form-card"
            style={{
              background: "#39304A",
              borderRadius: 16,
              padding: 32,
              display: "flex",
              flexDirection: "column",
              gap: 28,
              boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)",
              minWidth: 0,
            }}
          >
            <div style={{ marginBottom: 0, position: "relative" }}>
              <label
                className="form-label"
                style={{
                  fontSize: 19,
                  fontWeight: 600,
                  marginBottom: 10,
                  display: "block",
                }}
              >
                Export Type
              </label>
              <div style={{ position: "relative" }}>
                <select
                  className="form-select"
                  value={exportType}
                  onChange={(e) => {
                    setExportType(e.target.value as ExportType);
                    setFileType(e.target.value === "skeleton" ? "json" : "mp4");
                  }}
                  style={{
                    width: "100%",
                    padding: "16px 44px 16px 20px",
                    borderRadius: 10,
                    border: "none",
                    background: "#2D233B",
                    color: "#fff",
                    fontSize: 19,
                    marginTop: 8,
                    marginBottom: 0,
                    outline: "none",
                    boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)",
                    appearance: "none",
                  }}
                >
                  <option value="skeleton">Skeleton Extract</option>
                  <option value="preview">Preview Video</option>
                </select>
                <span
                  style={{
                    position: "absolute",
                    right: 18,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 8L10 13L15 8"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <label
                style={{
                  fontSize: 19,
                  fontWeight: 600,
                  marginBottom: 10,
                  display: "block",
                }}
              >
                File Type
              </label>
              <div style={{ position: "relative" }}>
                <select
                  className="form-select"
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value as FileType)}
                  style={{
                    width: "100%",
                    padding: "16px 44px 16px 20px",
                    borderRadius: 10,
                    border: "none",
                    background: "#2D233B",
                    color: "#fff",
                    fontSize: 19,
                    marginTop: 8,
                    outline: "none",
                    boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)",
                    appearance: "none",
                  }}
                >
                  {currentOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span
                  style={{
                    position: "absolute",
                    right: 18,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 8L10 13L15 8"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
        <button
          className="button-export"
          style={{
            width: 220,
            fontWeight: 500,
            fontSize: 18,
            margin: "32px auto 20px auto",
            background: "#159C74",
            color: "#18181B",
            border: "none",
            borderRadius: 14,
            height: 50,
            display: "block",
            boxShadow: "none",
          }}
          onClick={handleExport}
        >
          Export
        </button>
        <div className="flex gap-4 justify-center">
          <button
            className="button-back"
            style={{
              width: 220,
              fontWeight: 700,
              fontSize: 18,
              height: 50,
              background: backHover ? "#6D28D9" : "#8B5CF6",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              boxShadow: "none",
            }}
            onMouseEnter={() => setBackHover(true)}
            onMouseLeave={() => setBackHover(false)}
            onClick={handleBackToEditor}
          >
            Back to Editor
          </button>
          <button
            className="button-back"
            style={{
              width: 220,
              fontWeight: 700,
              fontSize: 18,
              height: 50,
              background: backHover ? "#6D28D9" : "#8B5CF6",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              boxShadow: "none",
            }}
            onMouseEnter={() => setBackHover(true)}
            onMouseLeave={() => setBackHover(false)}
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </div>
      </div>
      {/* Right Section */}
      <div
        className="export-preview"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 48,
          justifyContent: "center",
          alignItems: "flex-start",
          minWidth: 440,
          marginLeft: 100,
        }}
      >
        <div>
          <div
            className="preview-title"
            style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}
          >
            Skeleton Extract
          </div>
          <img
            className="preview-image"
            src={
              video
                ? videoService.getThumbnailUrl(video.id)
                : "https://as1.ftcdn.net/v2/jpg/02/48/42/64/1000_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg"
            }
            alt="Skeleton Extract Preview"
            style={{
              width: 525,
              height: 300,
              objectFit: "cover",
              borderRadius: 12,
              background: "#222",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://as1.ftcdn.net/v2/jpg/02/48/42/64/1000_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg";
            }}
          />
        </div>
        <div>
          <div
            className="preview-title"
            style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}
          >
            Preview
          </div>
          <img
            className="preview-image"
            src="https://as1.ftcdn.net/v2/jpg/02/48/42/64/1000_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg"
            alt="3D Skeleton Preview"
            style={{
              width: 525,
              height: 300,
              objectFit: "cover",
              borderRadius: 12,
              background: "#222",
            }}
          />
        </div>
      </div>
    </div>
  );
}
