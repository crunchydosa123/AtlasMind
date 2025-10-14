import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface AvatarData {
  src: string
  alt: string
  fallback: string
}

interface ProjectCardProps {
  imageUrl: string
  title: string
  description: string
  avatars: AvatarData[]
  onClick?: () => void
}

export const ProjectCard = ({ imageUrl, title, description, avatars, onClick }: ProjectCardProps) => {
  console.log(title, imageUrl)
  return (
    <Card>
      <CardHeader className="p-0">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-40 object-cover rounded-t-xl"
        />
      </CardHeader>

      <CardContent>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>

        <div className="flex -space-x-3 mt-2">
          {avatars.map((avatar, index) => (
            <Avatar key={index} className="h-10 w-10 border-2 border-background">
              <AvatarImage src={avatar.src} alt={avatar.alt} />
              <AvatarFallback>{avatar.fallback}</AvatarFallback>
            </Avatar>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        <Button variant="default" className="w-full" onClick={onClick}>
          Go to Project
        </Button>
      </CardFooter>
    </Card>
  )
}
