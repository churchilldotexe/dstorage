import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { OrganizationSwitcher, SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Header() {
   return (
      <div className="relative z-10 border-b bg-gray-50 py-4">
         <div className="absolute inset-0 flex grow items-center justify-center">
            <SignedIn>
               <Button asChild variant={"link"}>
                  <Link href={"/dashboard/files"}>My Files</Link>
               </Button>
            </SignedIn>
         </div>
         <div className="container flex w-full min-w-full items-center justify-between">
            <div className="z-10">
               <Link
                  href={"/"}
                  className="z-10 text-xl font-semibold text-gray-950 hover:underline"
               >
                  d&apos;Storage
               </Link>
            </div>
            <div className="flex justify-center space-x-4">
               <OrganizationSwitcher />
               <SignedIn>
                  <UserButton afterSignOutUrl={`${env.NEXT_PUBLIC_URL}/`} />
               </SignedIn>
               <SignedOut>
                  <SignInButton mode="modal">
                     <Button className="z-10">Sign in</Button>
                  </SignInButton>
               </SignedOut>
            </div>
         </div>
      </div>
   );
}
