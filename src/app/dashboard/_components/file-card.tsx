import { FileCardAction } from "@/app/dashboard/_components/file-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formattedDate } from "@/lib/utils";
import { type Doc } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { FileTextIcon, GanttChartIcon, ImageIcon } from "lucide-react";
import Image from "next/image";
import { type ReactNode } from "react";
import { api } from "../../../../convex/_generated/api";

type FilePropTypes = Doc<"files"> & { url: string | null; isFavorited: boolean };

export function FileCard({ file }: { file: FilePropTypes }) {
   const fileTypesIcon = {
      image: <ImageIcon />,
      pdf: <FileTextIcon />,
      csv: <GanttChartIcon />,
   } as Record<Doc<"files">["type"], ReactNode>;

   if (file.url === null) throw new Error("Url Doesn't exist, unable to download the file");

   const getUserProfile = useQuery(api.users.getUserProfile, { userId: file.userId });

   return (
      <Card>
         <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2 capitalize">
               <div>{fileTypesIcon[file.type]}</div> {file.name}
            </CardTitle>
            <div className="absolute right-2 top-2">
               <FileCardAction file={file} />
            </div>
         </CardHeader>

         <CardContent className="flex h-[200px] items-center justify-center">
            {file.type === "image" && (
               <div key={file._id} className="relative size-full">
                  <Image src={file.url} alt={file.name} fill style={{ objectFit: "contain" }} />
               </div>
            )}
            {file.type === "csv" && (
               <div key={file._id} className="relative size-full">
                  <Image src={"/csv.svg"} alt={file.name} fill style={{ objectFit: "contain" }} />
               </div>
            )}
            {file.type === "pdf" && (
               <div key={file._id} className="relative size-full">
                  <Image src={"/pdf.svg"} alt={file.name} fill style={{ objectFit: "contain" }} />
               </div>
            )}
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
