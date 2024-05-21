"use client";

import { Button } from "@/components/ui/button";
import { SignInButton, SignOutButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function HomePage() {
   const files = useQuery(api.files.getFiles);
   const createFile = useMutation(api.files.createFile);

   return (
      <main className="mx-auto h-screen w-screen">
         <SignedOut>
            <SignInButton mode="modal">
               <Button>Sign in here</Button>
            </SignInButton>
         </SignedOut>
         <SignedIn>
            <SignOutButton>
               <Button>oh hi sign out?</Button>
            </SignOutButton>
         </SignedIn>

         {files?.map((file) => <div key={file._id}>{file.name}</div>)}

         <Button onClick={() => createFile({ name: "oh hi" })}>test me</Button>
      </main>
   );
}
