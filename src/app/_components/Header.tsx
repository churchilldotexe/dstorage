import { Button } from "@/components/ui/button";
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
            <div>
               <Link href={"/"} className="text-xl font-semibold text-gray-950 hover:underline">
                  d&apos;Storage
               </Link>
            </div>
            <div className="flex justify-center space-x-4">
               <OrganizationSwitcher />
               <SignedIn>
                  <UserButton afterSignOutUrl="/" />
               </SignedIn>
               <SignedOut>
                  <SignInButton mode="modal">
                     <Button>Sign in</Button>
                  </SignInButton>
               </SignedOut>
            </div>
         </div>
      </div>
   );
}
