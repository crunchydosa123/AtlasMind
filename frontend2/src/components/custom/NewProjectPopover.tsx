import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

type Props = {}

const NewProjectPopover = (props: Props) => {
  return (
    <Popover modal={true}>
      <PopoverTrigger asChild>
        <Button variant={'outline'}>New project</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2 w-80">
          <Card>
            <CardHeader>
              <CardTitle>Make a new project</CardTitle>
              <CardDescription>
                Make a new project </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Mera Joota hai Japani"
                  required
                />
              </div>

              <div className="grid gap-2 my-4">
                <Label>Document URL</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="docs.google.com/your-mom"
                  required
                />
              </div>

              <div className="grid gap-2 my-4">
                <Label>Sheet URL</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="docs.google.com/your-mom"
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full" variant={'default'}>
          Create Project
        </Button>
      </CardFooter>
          </Card>
        </div>
      </PopoverContent>
    </Popover>

  )
}

export default NewProjectPopover