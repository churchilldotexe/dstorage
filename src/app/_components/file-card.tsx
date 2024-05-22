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
import { api } from "../../../convex/_generated/api";

import { type Doc } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { MoreVerticalIcon, Trash2Icon } from "lucide-react";
import { Fragment, useState } from "react";
import { toast } from "sonner";

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

export function FileCard({ file }: { file: FilePropTypes }) {
   return (
      <Card>
         <CardHeader className="relative">
            <CardTitle>{file.name}</CardTitle>
            {/* <CardDescription>Card Description</CardDescription> */}
            <div className="absolute right-2 top-2">
               <FileCardAction file={file} />
            </div>
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
