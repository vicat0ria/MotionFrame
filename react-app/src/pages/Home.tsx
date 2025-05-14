import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, User, Bell } from "lucide-react";
import logo from "@/assets/MF-logo.png";
import templateHome from "@/assets/template_home.png";
import "./Home.css";
import { useRef, useState, useEffect } from "react";
import routes from "@/routes";
import { videoService } from "@/services/videoService";
import { Project, Template } from "@/types/video.d";
import { useToast } from "@/components/ui/use-toast";
import { projectService } from "@/services/projectService";

const templates = [
  {
    id: 1,
    title: "Soccer Motion",
    description: "Extract soccer player motion from video.",
    image: templateHome,
    badge: "Free",
  },
  {
    id: 2,
    title: "Gym Workout",
    description: "Fitness pose template for gym scenes.",
    image: templateHome,
    badge: "Free",
  },
  {
    id: 3,
    title: "Horse Animation",
    description: "Quadruped animation template.",
    image: templateHome,
    badge: "Free",
  },
  {
    id: 4,
    title: "Cartoon Bear",
    description: "Stylized animal motion template.",
    image: templateHome,
    badge: "Free",
  },
  {
    id: 5,
    title: "Martial Arts",
    description: "Template for martial arts motion capture.",
    image: templateHome,
    badge: "Free",
  },
];

function Card({
  item,
  onClick,
  onDelete,
}: {
  item: Project | Template;
  onClick: () => void;
  onDelete?: () => void;
}) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div
      className="card rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer flex-shrink-0 mb-4 border border-white/10 relative group"
      onClick={onClick}
      style={{ minWidth: 307, width: 307, backgroundColor: "#1e1a2b" }}
    >
      {"videoId" in item && (
        <button
          onClick={handleDelete}
          className="button-delete absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
          title="Delete project"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      )}
      <div
        className="relative"
        style={{
          height: 192,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          overflow: "hidden",
        }}
      >
        <img
          src={
            "videoId" in item
              ? videoService.getThumbnailUrl(item.videoId)
              : item.image
          }
          alt={item.title}
          className="object-cover w-full h-full"
          onError={(e) => {
            (e.target as HTMLImageElement).src = templateHome;
          }}
        />
        <span className="absolute bottom-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full shadow">
          {item.badge}
        </span>
      </div>
      <div className="p-4">
        <div className="card-title font-semibold text-lg text-white mb-1">
          {item.title}
        </div>
        <div className="card-description text-white/70 text-sm">
          {item.description}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const location = useLocation();
  type LocationState = { project?: Project };
  const navState = location.state as LocationState;
  const projectsRef = useRef<HTMLDivElement>(null);
  const templatesRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);

  const { toast } = useToast();

  // Load projects and merge any updated project from navState
  useEffect(() => {
    const loadUserProjects = async () => {
      try {
        let fetched = await projectService.getUserProjects();
        const updated = navState?.project;
        if (updated) {
          fetched = fetched.map((p) => (p._id === updated._id ? updated : p));
        }
        setProjects(fetched);
      } catch (error) {
        console.error("Error loading projects:", error);
        toast({
          title: "Error",
          description: "Failed to load projects",
        });
        setProjects([]);
      }
    };

    loadUserProjects();
  }, [navState?.project]);

  const scrollByCard = (
    ref: React.RefObject<HTMLDivElement | null>,
    dir: "left" | "right"
  ) => {
    if (!ref.current) return;
    const cardWidth = 307 + 24; // card width + gap
    ref.current.scrollBy({
      left: dir === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  const handleProjectClick = async (project: Project) => {
    try {
      // Pre-fetch the video URL to ensure it's available
      await videoService.getVideoUrl(project.videoId);

      // Navigate to editor with project data
      navigate(routes.videoEditor, {
        state: {
          project: {
            ...project,
            videoId: project.videoId,
            videoTitle: project.videoTitle || project.title,
          },
          settings: project.settings,
        },
        replace: true, // Use replace instead of push to prevent adding to history
      });
    } catch (error) {
      console.error("Error loading project:", error);
      toast({
        title: "Error",
        description: "Failed to load project. Please try again.",
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await projectService.deleteProject(projectId);
      setProjects(projects.filter((p) => p._id !== projectId));
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
      });
    }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#2c223e" }}>
      {/* Sidebar */}
      <aside
        className="sidebar w-64 flex flex-col items-center py-8 px-4 border-r border-[#3a3a3a]"
        style={{ backgroundColor: "#413946" }}
      >
        <div className="flex items-center gap-2 mb-10">
          <img
            src={logo}
            alt="MotionFrame Logo"
            className="logo h-10 w-auto"
            style={{ filter: "invert(1) brightness(2)" }}
          />
          <span className="logo-text text-2xl font-bold text-white">
            MotionFrame
          </span>
        </div>
        <Button
          className="button-primary w-full bg-green-500 hover:bg-green-600 text-lg font-semibold rounded-lg py-3 mb-4"
          style={{ color: "#171734" }}
          onClick={() => navigate(routes.videoEditor)}
        >
          + Create new
        </Button>
      </aside>
      {/* Main Content */}
      <main className="page flex-1 p-10 overflow-x-auto relative">
        {/* Profile & Notifications Icons */}
        <div className="absolute top-8 right-8 z-10 flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="button-icon rounded-full border-white/20 text-white shadow-lg hover:bg-white/10"
            style={{ backgroundColor: "#0a0a0a", width: 50, height: 50 }}
          >
            <Bell style={{ width: 29, height: 29 }} />
          </Button>
          <Link to={routes.settings}>
            <Button
              variant="outline"
              size="icon"
              className="button-icon rounded-full border-white/20 text-white shadow-lg hover:bg-white/10"
              style={{ backgroundColor: "#0a0a0a", width: 50, height: 50 }}
            >
              <User style={{ width: 34, height: 34 }} />
            </Button>
          </Link>
        </div>
        <h1 className="page-title text-4xl font-bold text-white mb-8">Home</h1>
        {/* My Projects */}
        <section className="section mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title text-2xl font-bold text-white">
              My Projects
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="button-icon rounded-full border-white/20 text-white hover:bg-white/10"
                style={{ backgroundColor: "#0a0a0a", width: 40, height: 40 }}
                onClick={() => scrollByCard(projectsRef, "left")}
              >
                <ChevronLeft style={{ width: 16, height: 16 }} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="button-icon rounded-full border-white/20 text-white hover:bg-white/10"
                style={{ backgroundColor: "#0a0a0a", width: 40, height: 40 }}
                onClick={() => scrollByCard(projectsRef, "right")}
              >
                <ChevronRight style={{ width: 16, height: 16 }} />
              </Button>
            </div>
          </div>
          <div
            ref={projectsRef}
            className="card-grid flex gap-x-6 overflow-x-auto pb-2 w-full hide-scrollbar"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {projects.length > 0 ? (
              projects.map((project) => (
                <Card
                  key={project._id || project.id}
                  item={project}
                  onClick={() => handleProjectClick(project)}
                  onDelete={() =>
                    project._id && handleDeleteProject(project._id)
                  }
                />
              ))
            ) : (
              <div className="text-white/70 text-center w-full py-8">
                No projects yet. Click "Create new" to get started!
              </div>
            )}
          </div>
        </section>
        {/* Use a Template */}
        <section className="section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title text-2xl font-bold text-white">
              Use a Template
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="button-icon rounded-full border-white/20 text-white hover:bg-white/10"
                style={{ backgroundColor: "#0a0a0a", width: 40, height: 40 }}
                onClick={() => scrollByCard(templatesRef, "left")}
              >
                <ChevronLeft style={{ width: 16, height: 16 }} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="button-icon rounded-full border-white/20 text-white hover:bg-white/10"
                style={{ backgroundColor: "#0a0a0a", width: 40, height: 40 }}
                onClick={() => scrollByCard(templatesRef, "right")}
              >
                <ChevronRight style={{ width: 16, height: 16 }} />
              </Button>
            </div>
          </div>
          <div
            ref={templatesRef}
            className="card-grid flex gap-x-6 overflow-x-auto pb-2 w-full hide-scrollbar"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {templates.map((template) => (
              <Card
                key={`template-${template.id}`}
                item={template}
                onClick={() => alert(`Open template: ${template.title}`)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
