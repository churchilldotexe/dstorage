"use client";

import { api } from "../../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { type Id } from "convex/_generated/dataModel";

export default function SharedFilePage({ params }: { params: { fileId: Id<"_storage"> } }) {
   const getSharedFile = useQuery(api.files.getSharedFile, { fileId: params.fileId });

   if (getSharedFile === null) {
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

            <div className="py-8">
               {Boolean(getSharedFile?.fileType) ? (
                  <div className="container relative aspect-video size-full object-cover object-center">
                     <Image src={getSharedFile!.url} alt={`${getSharedFile?.name} preview`} fill />
                  </div>
               ) : (
                  <div className="container relative aspect-video size-full object-cover object-center">
                     <Image src={"/pdf.svg"} alt={`${getSharedFile?.name} preview`} fill />
                  </div>
               )}
            </div>
         </section>
      </main>
   );
}
