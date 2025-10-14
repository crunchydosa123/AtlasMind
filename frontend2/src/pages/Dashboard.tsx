import { AppSidebar } from "@/components/custom/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProjectCard } from "@/components/custom/ProjectCard";
import NewProjectPopover from "@/components/custom/NewProjectPopover";

const Dashboard = () => {
  const projectImages = [
    "/assets/image1.jpg",
    "/assets/image2.jpg",
    "/assets/image3.jpg",
  ];

  const projects = [
    {
      title: "Safe at Work",
      description: "Project to help people be safe at work",
      imageUrl: '/assets/image1.jpg',
      avatars: [
        { src: "https://github.com/shadcn.png", alt: "@shadcn", fallback: "SC" },
        { src: "https://github.com/vercel.png", alt: "@vercel", fallback: "VC" },
        { src: "https://github.com/pingdotgg.png", alt: "@ping", fallback: "PG" },
      ],
    },
    {
      title: "GreenEarth",
      description: "Helping organizations track sustainability metrics",
      imageUrl: '/assets/image2.jpg',
      avatars: [
        { src: "https://github.com/vercel.png", alt: "@vercel", fallback: "VC" },
        { src: "https://github.com/shadcn.png", alt: "@shadcn", fallback: "SC" },
      ],
    },
    {
      title: "AI Mentor",
      description: "Personalized AI mentorship system for students",
      imageUrl: '/assets/image3.jpg',
      avatars: [
        { src: "https://github.com/pingdotgg.png", alt: "@ping", fallback: "PG" },
        { src: "https://github.com/shadcn.png", alt: "@shadcn", fallback: "SC" },
        { src: "https://github.com/vercel.png", alt: "@vercel", fallback: "VC" },
      ],
    },
  ];

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full min-h-screen bg-gray-50 p-6">
        <SidebarTrigger />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold">Projects</h1>
          <NewProjectPopover />
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <ProjectCard
              key={index}
              title={project.title}
              description={project.description}
              imageUrl={project.imageUrl}
              avatars={project.avatars}
              onClick={() => console.log(`Go to ${project.title}`)}
            />
          ))}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default Dashboard;
