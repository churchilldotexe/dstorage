"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileIcon, Star } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SideNav() {
   const pathName = usePathname();
   return (
      <div className="flex w-40 flex-col items-start gap-4 pt-12">
         <Link href={"/dashboard/files"}>
            <Button
               variant={"link"}
               className={cn("flex w-full justify-start gap-2", {
                  "text-blue-400": pathName.includes("/dashboard/files"),
               })}
            >
               <FileIcon /> All Files
            </Button>
         </Link>
         <Link href={"/dashboard/favorites"}>
            <Button
               variant={"link"}
               className={cn("flex w-full justify-start gap-2", {
                  "text-blue-400": pathName.includes("/dashboard/favorites"),
               })}
            >
               <Star /> Favorites
            </Button>
         </Link>
      </div>
   );
}
