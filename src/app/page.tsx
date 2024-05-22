"use client";

import { FileCard } from "@/app/_components/file-card";
import { UploadButton } from "@/app/_components/upload-button";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
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

   return (
      <main className="container mx-auto space-y-6 pt-12">
         <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold">Your Files</h1>

            <UploadButton />
         </div>
         <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {files?.map((file) => <FileCard key={file._id} file={file} />)}
         </div>
      </main>
   );
}
