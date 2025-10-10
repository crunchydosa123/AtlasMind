import { AppSidebar } from "@/components/custom/Sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { ProjectCard } from "@/components/custom/ProjectCard"

const Dashboard = () => {
  const projects = [
    {
      title: "Safe at Work",
      description: "Project to help people be safe at work",
      imageUrl: "https://via.placeholder.com/400x160.png?text=Safe+at+Work",
      avatars: [
        { src: "https://github.com/shadcn.png", alt: "@shadcn", fallback: "SC" },
        { src: "https://github.com/vercel.png", alt: "@vercel", fallback: "VC" },
        { src: "https://github.com/pingdotgg.png", alt: "@ping", fallback: "PG" },
      ],
    },
    {
      title: "GreenEarth",
      description: "Helping organizations track sustainability metrics",
      imageUrl: "https://via.placeholder.com/400x160.png?text=GreenEarth",
      avatars: [
        { src: "https://github.com/vercel.png", alt: "@vercel", fallback: "VC" },
        { src: "https://github.com/shadcn.png", alt: "@shadcn", fallback: "SC" },
      ],
    },
    {
      title: "AI Mentor",
      description: "Personalized AI mentorship system for students",
      imageUrl: "https://via.placeholder.com/400x160.png?text=AI+Mentor",
      avatars: [
        { src: "https://github.com/pingdotgg.png", alt: "@ping", fallback: "PG" },
        { src: "https://github.com/shadcn.png", alt: "@shadcn", fallback: "SC" },
        { src: "https://github.com/vercel.png", alt: "@vercel", fallback: "VC" },
      ],
    },
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full h-screen">
        <SidebarTrigger />

        <div>
          <div className="text-3xl mb-4">Projects</div>
          <div className="w-full bg-gray-300 grid grid-cols-3 gap-4 p-4">
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
        </div>
      </main>
    </SidebarProvider>
  )
}

export default Dashboard
