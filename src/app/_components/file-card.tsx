import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Doc } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
   FileTextIcon,
   GanttChartIcon,
   ImageIcon,
   MoreVerticalIcon,
   Trash2Icon,
} from "lucide-react";
import Image from "next/image";
import { Fragment, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";

type FilePropTypes = Doc<"files">;

function FileCardAction({ file }: { file: FilePropTypes }) {
   const deleteFile = useMutation(api.files.deleteFile);

   const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

   return (
      <Fragment>
         <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                     This action cannot be undone. This will permanently delete your account and
                     remove your data from our servers.
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                     onClick={async () => {
                        await deleteFile({ fileId: file._id });
                        toast.info("File Deleted", {
                           description: "Your File is now remove successfully from the system",
                        });
                     }}
                  >
                     Continue
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>

         <DropdownMenu>
            <DropdownMenuTrigger>
               <MoreVerticalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
               <DropdownMenuItem
                  className="flex cursor-pointer items-center gap-2 text-destructive"
                  onClick={() => {
                     setIsConfirmOpen(true);
                  }}
               >
                  <Trash2Icon className="size-4" /> Delete
               </DropdownMenuItem>
            </DropdownMenuContent>
         </DropdownMenu>
      </Fragment>
   );
}

// function ImageFile({ name, url }: { url: string; name: string }) {
//    return <Image src={url} alt={name} width={"200"} height={"100"} />;
// }

export function FileCard({ file }: { file: FilePropTypes }) {
   const fileTypesIcon = {
      image: <ImageIcon />,
      pdf: <FileTextIcon />,
      csv: <GanttChartIcon />,
   } as Record<Doc<"files">["type"], ReactNode>;

   const fileUrls = useQuery(
      api.files.getFilesUrl,
      file.AuthId !== "" ? { AuthId: file.AuthId } : "skip"
   );

   return (
      <Card>
         <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
               <div>{fileTypesIcon[file.type]}</div> {file.name}
            </CardTitle>
            {/* <CardDescription>Card Description</CardDescription> */}
            <div className="absolute right-2 top-2">
               <FileCardAction file={file} />
            </div>
         </CardHeader>
         <CardContent className="flex h-[200px] items-center justify-center">
            {file.type === "image" &&
               fileUrls?.map(
                  (item) =>
                     file.fileId === item.fileId && (
                        <div key={item._id} className="relative aspect-video size-48">
                           <Image src={item.url!} alt={item.name} fill />
                        </div>
                     )
               )}
            {file.type === "csv" && <GanttChartIcon className="size-20" />}
            {file.type === "pdf" && <FileTextIcon className="size-20" />}
         </CardContent>
         <CardFooter>
            <Button type="button">Download</Button>
         </CardFooter>
      </Card>
   );
}
