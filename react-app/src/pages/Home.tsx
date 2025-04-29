import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, User, Bell } from 'lucide-react';
import logo from "@/assets/MF-logo.png";
import templateHome from "@/assets/template_home.png";
import './Home.css';
import { useRef } from "react";
import routes from "@/components/routes";

// Mock data
const projects = [
  {
    id: 1,
    title: "Skeleton Boogie",
    description: "Dynamic dancing skeleton used in Unity.",
    image: templateHome,
    badge: "AI",
  },
  {
    id: 2,
    title: "Parkour",
    description: "To import into Blender for class project.",
    image: templateHome,
    badge: "Import",
  },
  {
    id: 3,
    title: "Anime Fights",
    description: "A fight scene generator for 3D anime-style characters.",
    image: templateHome,
    badge: "AI",
  },
  {
    id: 4,
    title: "Yoga Trainer",
    description: "Use yoga poses for import into Blender",
    image: templateHome,
    badge: "Import",
  },
  {
    id: 5,
    title: "Dance Loop",
    description: "Looping dance animation for quick previews.",
    image: templateHome,
    badge: "AI",
  },
];

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

function Card({ item, onClick }: { item: any; onClick: () => void }) {
  return (
    <div
      className="rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer flex-shrink-0 mb-4 border border-white/10"
      onClick={onClick}
      style={{ minWidth: 307, width: 307, backgroundColor: '#1e1a2b' }}
    >
      <div className="relative" style={{ height: 192, borderTopLeftRadius: 12, borderTopRightRadius: 12, overflow: 'hidden' }}>
        <img src={item.image} alt={item.title} className="object-cover w-full h-full" />
        <span className="absolute bottom-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full shadow">
          {item.badge}
        </span>
      </div>
      <div className="p-4">
        <div className="font-semibold text-lg text-white mb-1">{item.title}</div>
        <div className="text-white/70 text-sm">{item.description}</div>
      </div>
    </div>
  );
}

export default function Home() {
  const projectsRef = useRef<HTMLDivElement>(null);
  const templatesRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (ref: React.RefObject<HTMLDivElement>, dir: 'left' | 'right') => {
    if (ref.current) {
      const cardWidth = 307 + 24; // card width + gap
      ref.current.scrollBy({ left: dir === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#2c223e' }}>
      {/* Sidebar */}
      <aside
        className="w-64 flex flex-col items-center py-8 px-4 border-r border-[#3a3a3a]"
        style={{ backgroundColor: '#413946' }}
      >
        <div className="flex items-center gap-2 mb-10">
          <img src={logo} alt="MotionFrame Logo" className="h-10 w-auto" style={{ filter: 'invert(1) brightness(2)' }} />
          <span className="text-2xl font-bold text-white">MotionFrame</span>
        </div>
        <Button 
          className="w-full bg-green-500 hover:bg-green-600 text-lg font-semibold rounded-lg py-3 mb-4"
          style={{ color: '#171734' }}
        >
          + Create new
        </Button>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-10 overflow-x-auto relative">
        {/* Profile & Notifications Icons */}
        <div className="absolute top-8 right-8 z-10 flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-full border-white/20 text-white shadow-lg hover:bg-white/10" style={{ backgroundColor: '#0a0a0a', width: 50, height: 50 }}>
            <Bell style={{ width: 29, height: 29 }} />
          </Button>
          <Link to={routes.settings}>
            <Button variant="outline" size="icon" className="rounded-full border-white/20 text-white shadow-lg hover:bg-white/10" style={{ backgroundColor: '#0a0a0a', width: 50, height: 50 }}>
              <User style={{ width: 34, height: 34 }} />
            </Button>
          </Link>
        </div>
        <h1 className="text-4xl font-bold text-white mb-8">Home</h1>
        {/* My Projects */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">My Projects</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-full border-white/20 text-white hover:bg-white/10" style={{ backgroundColor: '#0a0a0a', width: 40, height: 40 }} onClick={() => scrollByCard(projectsRef, 'left')}><ChevronLeft style={{ width: 16, height: 16 }} /></Button>
              <Button variant="outline" size="icon" className="rounded-full border-white/20 text-white hover:bg-white/10" style={{ backgroundColor: '#0a0a0a', width: 40, height: 40 }} onClick={() => scrollByCard(projectsRef, 'right')}><ChevronRight style={{ width: 16, height: 16 }} /></Button>
            </div>
          </div>
          <div ref={projectsRef} className="flex gap-x-6 overflow-x-auto pb-2 w-full hide-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
            {projects.map((project) => (
              <Card key={project.id} item={project} onClick={() => alert(`Open project: ${project.title}`)} />
            ))}
          </div>
        </section>
        {/* Use a Template */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Use a Template</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-full border-white/20 text-white hover:bg-white/10" style={{ backgroundColor: '#0a0a0a', width: 40, height: 40 }} onClick={() => scrollByCard(templatesRef, 'left')}><ChevronLeft style={{ width: 16, height: 16 }} /></Button>
              <Button variant="outline" size="icon" className="rounded-full border-white/20 text-white hover:bg-white/10" style={{ backgroundColor: '#0a0a0a', width: 40, height: 40 }} onClick={() => scrollByCard(templatesRef, 'right')}><ChevronRight style={{ width: 16, height: 16 }} /></Button>
            </div>
          </div>
          <div ref={templatesRef} className="flex gap-x-6 overflow-x-auto pb-2 w-full hide-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
            {templates.map((template) => (
              <Card key={template.id} item={template} onClick={() => alert(`Open template: ${template.title}`)} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
} 