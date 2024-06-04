"use client";

import { FileForm } from "@/app/dashboard/_components/file-form";
import { Button } from "@/components/ui/button";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export function UploadButton() {
   const [isFileDiaglogOpen, setIsFileDiaglogOpen] = useState<boolean>(false);
   const [objectUrls, setObjectUrls] = useState<string[]>([]);

   return (
      <Dialog
         open={isFileDiaglogOpen}
         onOpenChange={(open) => {
            setIsFileDiaglogOpen(open);
            // form.reset();
            // dispatch({ type: "RESET" });
            objectUrls.forEach((url) => {
               URL.revokeObjectURL(url);
            });
         }}
      >
         <DialogTrigger asChild>
            <Button>Upload File</Button>
         </DialogTrigger>
         <DialogContent>
            <DialogHeader>
               <DialogTitle className="pb-4">Upload Your File</DialogTitle>
               <DialogDescription>
                  <FileForm
                     setIsFileDiaglogOpen={setIsFileDiaglogOpen}
                     setObjectUrls={setObjectUrls}
                  />
               </DialogDescription>
            </DialogHeader>
         </DialogContent>
      </Dialog>
   );
}
