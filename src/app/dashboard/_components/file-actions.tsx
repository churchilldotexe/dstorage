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
import { env } from "@/env";
import { Protect } from "@clerk/nextjs";
import { type Doc } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
   Clipboard,
   FileIcon,
   MoreVerticalIcon,
   PencilLine,
   StarHalf,
   StarIcon,
   Trash2Icon,
   Undo2Icon,
   View,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";

type FilePropTypes = Doc<"files"> & { url: string | null; isFavorited: boolean };

export function FileCardAction({ file }: { file: FilePropTypes }) {
   const deleteFile = useMutation(api.files.deleteFile);
   const restoreFile = useMutation(api.files.restoreFile);
   const shareFile = useMutation(api.files.shareFile);
   const toggleFavorites = useMutation(api.files.toggleFavorites);
   const removeSharedFile = useMutation(api.files.removeSharedFile);
   const me = useQuery(api.users.getMe);
   const getSharedFile = useQuery(api.files.getSharedFile, { fileId: file.fileId });
   const isFileShared = getSharedFile !== null;

   const router = useRouter();
   const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
   const [isRenameDialogOpen, setIsRenameDialogOpen] = useState<boolean>(false);

   const handleItemDeletionOrRestoration = async () => {
      if (Boolean(file.shouldDelete)) {
         await restoreFile({ fileId: file._id });
      } else {
         setIsConfirmOpen(true);
      }
   };

   const linkToPreview = `/shared-file/${file.fileId}`;
   const linkToCopy = `${env.NEXT_PUBLIC_URL}${linkToPreview}`;

   if (file.url === null) throw new Error("Url Doesn't exist, unable to download the file");

   const handleCopyToClipboard = async () => {
      if (file.url !== null && !isFileShared) {
         await shareFile({
            name: file.name,
            fileType: file.type,
            fileId: file.fileId,
            url: file.url,
         });
         await navigator.clipboard.writeText(linkToCopy);
         toast.success("File Sharing On", {
            description:
               "Your file has been successfully copied to the clipboard and is now ready to be shared.",
         });
      } else if (isFileShared) {
         await removeSharedFile({ fileId: file.fileId });
      }
   };

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

               <DropdownMenuItem
                  className="flex cursor-pointer items-center gap-2 "
                  onClick={async () => {
                     await handleCopyToClipboard();
                  }}
               >
                  <div className="flex items-center gap-2">
                     <label
                        htmlFor="check"
                        data-is-check={isFileShared}
                        className="flex h-5 w-10 items-center rounded-full bg-gray-400 data-[is-check=true]:bg-green-500"
                     >
                        <input
                           type="checkbox"
                           id="check"
                           className="peer sr-only"
                           checked={isFileShared}
                           readOnly
                        />
                        <span className="ml-[.15em] size-4 rounded-full bg-gray-50 peer-checked:ml-auto peer-checked:mr-[.15em]" />
                     </label>
                     {isFileShared ? "Shared" : "Share"}
                  </div>
               </DropdownMenuItem>

               {isFileShared && (
                  <Fragment>
                     <DropdownMenuItem
                        className="flex cursor-pointer items-center gap-2 "
                        onClick={() => {
                           router.push(linkToPreview);
                        }}
                     >
                        <View className="size-4" /> View
                     </DropdownMenuItem>
                     <DropdownMenuItem
                        className="flex cursor-pointer items-center gap-2 "
                        onClick={async () => {
                           await navigator.clipboard.writeText(linkToCopy);
                           toast.success("Link copied to clipboard", {
                              description: "You can now share your files",
                           });
                        }}
                     >
                        <Fragment>
                           <Clipboard className="size-4" /> Copy Link
                        </Fragment>
                     </DropdownMenuItem>
                  </Fragment>
               )}

               <Protect
                  condition={(check) => {
                     return (
                        check({
                           role: "org:admin",
                        }) || file.userId === me?._id
                     );
                  }}
                  // eslint-disable-next-line react/jsx-no-useless-fragment
                  fallback={<Fragment></Fragment>}
               >
                  <DropdownMenuItem
                     onClick={() => {
                        setIsRenameDialogOpen(true);
                     }}
                  >
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
