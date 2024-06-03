import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type ImagePreviewProps = { previews: string[] };

export default function ImagePreview({ previews }: ImagePreviewProps) {
   const [currentIndex, setCurrentIndex] = useState<number>(0);
   console.log("currentIndex", currentIndex);

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
         <button type="button" onClick={handlePrevImage}>
            <ChevronLeft />
         </button>

         <div className="flex size-80 overflow-hidden">
            {previews.map((url, index) => (
               <div key={index} className="relative size-full shrink-0">
                  <Image
                     style={{ translate: `${-100 * currentIndex}%` }}
                     sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                     alt={`preview ${index}`}
                     src={url}
                     className="size-full object-cover object-center transition-all duration-500 ease-in-out"
                     fill
                  />
               </div>
            ))}
         </div>

         <button type="button" onClick={handleNextImage}>
            <ChevronRight />
         </button>
      </div>
   );
}
