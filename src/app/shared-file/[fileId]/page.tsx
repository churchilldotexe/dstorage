"use client";

import { api } from "../../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { type Id } from "convex/_generated/dataModel";

export default function SharedFilePage({ params }: { params: { fileId: Id<"_storage"> } }) {
   const getSharedFile = useQuery(api.files.getSharedFile, { fileId: params.fileId });

   if (!Boolean(getSharedFile)) {
      return <div>File is not valid</div>;
   }

   if (getSharedFile?.url === null) {
      throw new Error("Unable to download the file");
   }

   return (
      <main>
         <section>
            <div className="container flex w-full items-center justify-between py-6">
               <div className="text-2xl font-semibold">{getSharedFile?.name}</div>
               <Button onClick={() => window.open(getSharedFile?.url, "_blank")}>Download</Button>
            </div>
            {Boolean(getSharedFile?.fileType) ? (
               <div className="container relative aspect-auto size-full">
                  <Image src={getSharedFile!.url} alt={`${getSharedFile?.name} preview`} fill />
               </div>
            ) : (
               <div>{getSharedFile?.fileType}</div>
            )}
         </section>
      </main>
   );
}
