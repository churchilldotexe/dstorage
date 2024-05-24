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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formattedDate } from "@/lib/utils";
import { Protect } from "@clerk/nextjs";
import { type Doc } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
   FileIcon,
   FileTextIcon,
   GanttChartIcon,
   ImageIcon,
   MoreVerticalIcon,
   StarHalf,
   StarIcon,
   Trash2Icon,
   Undo2Icon,
} from "lucide-react";
import Image from "next/image";
import { Fragment, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";

type FilePropTypes = Doc<"files">;

function FileCardAction({
   file,
   isFavorited,
}: {
   file: FilePropTypes & { url: string | null };
   isFavorited: boolean;
}) {
   const deleteFile = useMutation(api.files.deleteFile);
   const restoreFile = useMutation(api.files.restoreFile);
   const toggleFavorites = useMutation(api.files.toggleFavorites);

   const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

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
                  {isFavorited ? (
                     <div className="flex items-center gap-1">
                        <StarIcon className="size-4" /> UnFavorite
                     </div>
                  ) : (
                     <div className="flex items-center gap-1">
                        <StarHalf className="size-4" /> Favorite
                     </div>
                  )}
               </DropdownMenuItem>

               <Protect role="org:admin" fallback={<Fragment></Fragment>}>
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

export function FileCard({
   file,
   favorites,
}: {
   file: FilePropTypes & { url: string | null };
   favorites: Array<Doc<"favorites">>;
}) {
   const fileTypesIcon = {
      image: <ImageIcon />,
      pdf: <FileTextIcon />,
      csv: <GanttChartIcon />,
   } as Record<Doc<"files">["type"], ReactNode>;

   if (file.url === null) throw new Error("Url Doesn't exist, unable to download the file");

   const isFavorited = favorites.some((favorite) => favorite.fileId === file._id);
   const getUserProfile = useQuery(api.users.getUserProfile, { userId: file.userId });

   return (
      <Card>
         <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2 capitalize">
               <div>{fileTypesIcon[file.type]}</div> {file.name}
            </CardTitle>
            <div className="absolute right-2 top-2">
               <FileCardAction file={file} isFavorited={isFavorited} />
            </div>
         </CardHeader>
         <CardContent className="flex h-[200px] items-center justify-center">
            {file.type === "image" && (
               <div key={file._id} className="relative size-full">
                  <Image src={file.url} alt={file.name} fill style={{ objectFit: "contain" }} />
               </div>
            )}
            {file.type === "csv" && <GanttChartIcon className="size-20" />}
            {file.type === "pdf" && <FileTextIcon className="size-20" />}
         </CardContent>
         <CardFooter className="flex flex-wrap justify-between gap-2 text-sm font-semibold text-gray-500">
            <div className="flex items-center gap-2 ">
               <Avatar className="size-6">
                  <AvatarImage src={getUserProfile?.image} />
                  <AvatarFallback>CN</AvatarFallback>
               </Avatar>

               <div className="line-clamp-1 grow-0">{getUserProfile?.name}</div>
            </div>

            <div>Uploaded on {formattedDate(file._creationTime)}</div>
         </CardFooter>
      </Card>
   );
}
