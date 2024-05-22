"use client";

import { FileCard } from "@/app/_components/file-card";
import { UploadButton } from "@/app/_components/upload-button";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Fragment } from "react";
import { api } from "../../convex/_generated/api";

export default function HomePage() {
   const user = useAuth();
   const hasUser = user.userId === null || user.userId === undefined;
   const hasOrgId = user.orgId === null || user.orgId === undefined;

   let AuthId = "";
   if (!hasOrgId) {
      AuthId = user.orgId;
   } else if (!hasUser) {
      AuthId = user.userId;
   }

   const files = useQuery(api.files.getFiles, AuthId !== "" ? { AuthId } : "skip");
   const isLoading = files === undefined;

   return (
      <main className="container mx-auto space-y-6 pt-12">
         {isLoading && (
            <div className="fixed inset-0 m-auto flex size-fit flex-col items-center justify-center">
               <Loader2 className="size-32 animate-spin text-gray-700" />
               <span className="text-xl font-medium text-gray-950">Loading</span>
            </div>
         )}

         {!isLoading && files?.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-8">
               <div className="relative aspect-video size-full">
                  <Image
                     alt="A person and a folder image"
                     src="/empty.svg"
                     fill
                     sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
               </div>
               <div className="text-center text-2xl font-medium">
                  You have no files, Go ahead an upload one now
               </div>
               <UploadButton />
            </div>
         )}

         {!isLoading && files?.length > 0 && (
            <Fragment>
               <div className="flex items-center justify-between">
                  <h1 className="text-4xl font-bold">Your Files</h1>
                  <UploadButton />
               </div>
               <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {files?.map((file) => <FileCard key={file._id} file={file} />)}
               </div>
            </Fragment>
         )}
      </main>
   );
}
