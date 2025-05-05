import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Upload } from "lucide-react";

export default function Export() {
  const [projectTitle, setProjectTitle] = useState("Untitled Project");
  const [exportType, setExportType] = useState("skeleton");
  const [fileType, setFileType] = useState("json");
  const [exportHover, setExportHover] = useState(false);
  const [backHover, setBackHover] = useState(false);

  const skeletonOptions = [
    { value: "json", label: ".json" },
    { value: "bvh", label: ".bvh" },
    { value: "fbx", label: ".fbx" },
    { value: "csv", label: ".csv" },
  ];
  const videoOptions = [
    { value: "mp4", label: ".mp4" },
    { value: "mov", label: ".mov" },
    { value: "avi", label: ".avi" },
    { value: "webm", label: ".webm" },
  ];
  const currentOptions = exportType === "skeleton" ? skeletonOptions : videoOptions;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#2D233B",
      color: "#fff",
      display: "flex",
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "flex-start",
      padding: "40px 0 40px 100px",
      boxSizing: "border-box",
    }}>
      {/* Left Section */}
      <div style={{ width: 504, marginRight: 80, minWidth: 504 }}>
        <h1 style={{ fontSize: 48, fontWeight: 700, marginBottom: 32 }}>Export</h1>
        <div style={{ marginBottom: 32 }}>
          <Label htmlFor="project-title" style={{ fontSize: 24, fontWeight: 600, marginBottom: 16, display: "block" }}>
            Project Title
          </Label>
          <Input
            id="project-title"
            value={projectTitle}
            onChange={e => setProjectTitle(e.target.value)}
            style={{
              background: "#39304A",
              color: "#fff",
              border: "none",
              fontSize: 20,
              padding: "16px 20px",
              borderRadius: 8,
              marginTop: 8,
              marginBottom: 0
            }}
          />
        </div>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>Select Export</div>
          <div style={{
            background: "#39304A",
            borderRadius: 16,
            padding: 32,
            display: "flex",
            flexDirection: "column",
            gap: 28,
            boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)",
            minWidth: 0
          }}>
            <div style={{ marginBottom: 0, position: "relative" }}>
              <label style={{ fontSize: 19, fontWeight: 600, marginBottom: 10, display: "block" }}>Export Type</label>
              <div style={{ position: "relative" }}>
                <select
                  value={exportType}
                  onChange={e => {
                    setExportType(e.target.value);
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
                    appearance: "none"
                  }}
                >
                  <option value="skeleton">Skeleton Extract</option>
                  <option value="preview">Preview Video</option>
                </select>
                <span style={{
                  position: "absolute",
                  right: 18,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  display: "flex",
                  alignItems: "center"
                }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 8L10 13L15 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <label style={{ fontSize: 19, fontWeight: 600, marginBottom: 10, display: "block" }}>File Type</label>
              <div style={{ position: "relative" }}>
                <select
                  value={fileType}
                  onChange={e => setFileType(e.target.value)}
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
                    appearance: "none"
                  }}
                >
                  {currentOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <span style={{
                  position: "absolute",
                  right: 18,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  display: "flex",
                  alignItems: "center"
                }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 8L10 13L15 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
        <Button
          style={{
            width: 220,
            fontWeight: 500,
            fontSize: 18,
            margin: '32px auto 20px auto',
            background: exportHover ? '#12805e' : "#159C74",
            color: "#18181B",
            border: "none",
            borderRadius: 14,
            height: 50,
            display: "block",
            boxShadow: "none"
          }}
          size="lg"
          variant="default"
          onMouseEnter={() => setExportHover(true)}
          onMouseLeave={() => setExportHover(false)}
        >
          <Upload style={{ width: 22, height: 22, marginRight: 8, display: 'inline-block', verticalAlign: 'middle' }} />
          Export
        </Button>
        <Button
          variant="secondary"
          style={{
            marginTop: 0,
            width: 220,
            fontWeight: 700,
            fontSize: 18,
            height: 50,
            display: 'block',
            marginLeft: 'auto',
            marginRight: 'auto',
            background: backHover ? '#6D28D9' : '#8B5CF6',
            color: '#fff',
            border: 'none',
            borderRadius: 14,
            boxShadow: 'none',
          }}
          onMouseEnter={() => setBackHover(true)}
          onMouseLeave={() => setBackHover(false)}
          onClick={() => window.location.href = "/dashboard"}
        >
          Back to Home
        </Button>
      </div>
      {/* Right Section */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 48, justifyContent: "center", alignItems: "flex-start", minWidth: 440, marginLeft: 100 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Skeleton Extract</div>
          <img
            src="https://as1.ftcdn.net/v2/jpg/02/48/42/64/1000_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg"
            alt="Skeleton Extract Preview"
            style={{ width: 525, height: 300, objectFit: "cover", borderRadius: 12, background: "#222" }}
          />
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Preview</div>
          <img
            src="https://as1.ftcdn.net/v2/jpg/02/48/42/64/1000_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg"
            alt="3D Skeleton Preview"
            style={{ width: 525, height: 300, objectFit: "cover", borderRadius: 12, background: "#222" }}
          />
        </div>
      </div>
    </div>
  );
} 