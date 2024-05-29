import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Footer() {
   return (
      <div className="mt-12 border-t border-gray-900/5 bg-gray-50 py-4">
         <div className="container flex items-center justify-between">
            <p className="text-xs text-gray-600 dark:text-gray-400">
               Copyright © {new Date().getFullYear()}{" "}
               <Button className="px-2 text-blue-600" variant={"link"} asChild>
                  <Link href={"/"}>d&apos;Storage</Link>
               </Button>
            </p>

            <ul className="flex items-center gap-2">
               <li>
                  <Button className="text-muted-foreground" variant={"link"} asChild>
                     <Link href={"/privacy-policy"}>Privacy Policy</Link>
                  </Button>
               </li>
               <li>
                  <Button className="text-muted-foreground" variant={"link"} asChild>
                     <Link href={"/tos"}>Term of Service</Link>
                  </Button>
               </li>
               <li>
                  <Button className="text-muted-foreground" variant={"link"} asChild>
                     <Link href={"/about"}>About</Link>
                  </Button>
               </li>
            </ul>
         </div>
      </div>
   );
}
