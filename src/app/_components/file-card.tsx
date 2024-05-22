import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { type Doc } from "convex/_generated/dataModel";

type FilePropTypes = Doc<"files">;

export function FileCard({ file }: { file: FilePropTypes }) {
   return (
      <Card>
         <CardHeader>
            <CardTitle>{file.name}</CardTitle>
            {/* <CardDescription>Card Description</CardDescription> */}
         </CardHeader>
         <CardContent>
            <p>Card Content</p>
         </CardContent>
         <CardFooter>
            <Button type="button">Download</Button>
         </CardFooter>
      </Card>
   );
}
