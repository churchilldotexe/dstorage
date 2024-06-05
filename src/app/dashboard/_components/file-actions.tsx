import { RenameForm } from "@/app/dashboard/_components/rename-form";
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
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Protect } from "@clerk/nextjs";
import { type Doc } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
   FileIcon,
   MoreVerticalIcon,
   PencilLine,
   StarHalf,
   StarIcon,
   Trash2Icon,
   Undo2Icon,
} from "lucide-react";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
type FilePropTypes = Doc<"files"> & { url: string | null; isFavorited: boolean };

export function FileCardAction({ file }: { file: FilePropTypes }) {
   const deleteFile = useMutation(api.files.deleteFile);
   const restoreFile = useMutation(api.files.restoreFile);
   const toggleFavorites = useMutation(api.files.toggleFavorites);
   const me = useQuery(api.users.getMe);

   const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
   const [isRenameDialogOpen, setIsRenameDialogOpen] = useState<boolean>(false);

   const handleRenameFile = async () => {
      setIsRenameDialogOpen(true);
   };

   const handleItemDeletionOrRestoration = async () => {
      if (Boolean(file.shouldDelete)) {
         await restoreFile({ fileId: file._id });
      } else {
         setIsConfirmOpen(true);
      }
   };

   if (file.url === null) throw new Error("Url Doesn't exist, unable to download the file");

   return (
      <Fragment>
         <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                     This action will mark the file for deletion process. Files are deleted
                     periodically.
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                     onClick={async () => {
                        await deleteFile({ fileId: file._id });
                        toast.info("File marked for deletion", {
                           description: "Your File is now moved to trash and will be deleted soon",
                        });
                     }}
                  >
                     Continue
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>

         <Dialog
            open={isRenameDialogOpen}
            onOpenChange={(open) => {
               setIsRenameDialogOpen(open);
            }}
         >
            <DialogContent>
               <DialogHeader>
                  <DialogTitle className="pb-4">Rename your file</DialogTitle>
                  <DialogDescription>
                     <RenameForm file={file} setIsRenameDialogOpen={setIsRenameDialogOpen} />
                  </DialogDescription>
               </DialogHeader>
            </DialogContent>
         </Dialog>

         <DropdownMenu>
            <DropdownMenuTrigger>
               <MoreVerticalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
               {/*  //TODO add new action for share link.. it will copy to clipboard the link to a new route (make a new route for shared image.. /*/}

               <DropdownMenuItem
                  className="flex cursor-pointer items-center gap-2 "
                  onClick={() => {
                     window.open(file.url!, "_blank");
                  }}
               >
                  <FileIcon className="size-4" /> Download
               </DropdownMenuItem>

               <DropdownMenuItem
                  className="flex cursor-pointer items-center gap-2 "
                  onClick={async () => {
                     await toggleFavorites({ fileId: file._id });
                  }}
               >
                  {file.isFavorited ? (
                     <div className="flex items-center gap-1">
                        <StarIcon className="size-4" /> UnFavorite
                     </div>
                  ) : (
                     <div className="flex items-center gap-1">
                        <StarHalf className="size-4" /> Favorite
                     </div>
                  )}
               </DropdownMenuItem>

               <Protect
                  condition={(check) => {
                     return (
                        check({
                           role: "org:admin",
                        }) || file.userId === me?._id
                     );
                  }}
                  fallback={<Fragment></Fragment>}
               >
                  <DropdownMenuItem onClick={handleRenameFile}>
                     <div className="flex items-center gap-1">
                        <PencilLine className="size-4" /> Rename
                     </div>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleItemDeletionOrRestoration}>
                     {Boolean(file.shouldDelete) ? (
                        <div className="flex cursor-pointer items-center gap-2 text-green-500">
                           <Undo2Icon className="size-4" /> Restore
                        </div>
                     ) : (
                        <div className="flex cursor-pointer items-center gap-2 text-destructive">
                           <Trash2Icon className="size-4" /> Delete
                        </div>
                     )}
                  </DropdownMenuItem>
               </Protect>
            </DropdownMenuContent>
         </DropdownMenu>
      </Fragment>
   );
}
