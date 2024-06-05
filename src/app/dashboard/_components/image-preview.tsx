"use client";

import { type PreviewsArrayType } from "@/app/dashboard/_components/file-form";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Fragment, useState } from "react";

type ImagePreview = { previews: PreviewsArrayType };

export default function ImagePreview({ previews }: ImagePreview) {
   const [currentIndex, setCurrentIndex] = useState<number>(0);

   function handleNextImage() {
      if (currentIndex === previews.length - 1) {
         setCurrentIndex(previews.length - 1);
      } else {
         setCurrentIndex((prevIndex) => prevIndex + 1);
      }
   }
   function handlePrevImage() {
      if (currentIndex === 0) {
         setCurrentIndex(0);
      } else {
         setCurrentIndex((prevIndex) => prevIndex - 1);
      }
   }

   return (
      <div className="flex items-center justify-center">
         <button
            className="text-gray-950 hover:scale-105 focus-visible:scale-105 active:scale-95"
            type="button"
            onClick={handlePrevImage}
         >
            <ChevronLeft className="size-8 " />
         </button>

         <div className="flex size-80 overflow-hidden">
            {previews.map((preview, index) => (
               <Fragment key={index}>
                  <div className="relative size-full shrink-0">
                     <p
                        style={{ translate: `${-100 * currentIndex}%` }}
                        className="absolute z-20 w-full pt-2 text-center text-gray-950"
                     >
                        {preview.name}
                     </p>

                     <Image
                        style={{ translate: `${-100 * currentIndex}%` }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        src={preview.url}
                        className="z-10 size-full object-cover object-center transition-all duration-300 ease-in-out"
                        fill
                        alt={`${preview.name} preview`}
                     />
                  </div>
               </Fragment>
            ))}
         </div>

         <button
            className="text-gray-950 hover:scale-105 focus-visible:scale-105 active:scale-95"
            type="button"
            onClick={handleNextImage}
         >
            <ChevronRight className="size-8 " />
         </button>
      </div>
   );
}
