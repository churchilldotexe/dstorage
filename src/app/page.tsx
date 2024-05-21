"use client";

import { Button } from "@/components/ui/button";
import { SignInButton, SignOutButton, SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function HomePage() {
   const user = useAuth();
   const hasUser = user.userId === null || user.userId === undefined;
   const hasOrgId = user.orgId === null || user.orgId === undefined;

   let AuthId = "";
   console.log("AuthId", AuthId);
   if (!hasOrgId) {
      AuthId = user.orgId;
   } else if (!hasUser) {
      AuthId = user.userId;
   }

   const files = useQuery(api.files.getFiles, AuthId !== "" ? { AuthId } : "skip");
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

         <Button
            onClick={async () => {
               if (AuthId === "") return;
               console.log("ran");
               await createFile({
                  name: "oh hi",
                  AuthId,
               });
            }}
         >
            test me
         </Button>
      </main>
   );
}
