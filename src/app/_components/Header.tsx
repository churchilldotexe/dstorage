import { Button } from "@/components/ui/button";
import { OrganizationSwitcher, SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Header() {
   return (
      <div className="border-b bg-gray-50 py-4">
         <div className="container mx-auto flex items-center justify-between">
            <Link href={"/"} className="font-semibold text-gray-950 hover:underline">
               oh hi
            </Link>
            <div className="space-x-4">
               <OrganizationSwitcher />
               <SignedIn>
                  <UserButton />
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
