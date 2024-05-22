"use client";

import { Button } from "@/components/ui/button";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../convex/_generated/api";

const formSchema = z.object({
   title: z.string().min(2).max(50),
   file: z
      .custom<FileList>((val) => val instanceof FileList, "Required")
      .refine((files) => files.length > 0, "Required"),
});

export default function HomePage() {
   const user = useAuth();
   const hasUser = user.userId === null || user.userId === undefined;
   const hasOrgId = user.orgId === null || user.orgId === undefined;

   const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         title: "",
         file: undefined,
      },
   });

   const fileRef = form.register("file");

   function onSubmit(values: z.infer<typeof formSchema>) {
      console.log(values);
   }

   let AuthId = "";
   if (!hasOrgId) {
      AuthId = user.orgId;
   } else if (!hasUser) {
      AuthId = user.userId;
   }

   const files = useQuery(api.files.getFiles, AuthId !== "" ? { AuthId } : "skip");
   const createFile = useMutation(api.files.createFile);

   const handleUploadFile = async () => {
      if (AuthId === "") return;
      console.log("ran");
      await createFile({
         name: "oh hi",
         AuthId,
      });
   };

   return (
      <main className="container mx-auto pt-12">
         <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold">Your Files</h1>

            <Dialog>
               <DialogTrigger asChild>
                  <Button onClick={handleUploadFile}>Upload File</Button>
               </DialogTrigger>
               <DialogContent>
                  <DialogHeader>
                     <DialogTitle className="pb-4">Upload Your File</DialogTitle>
                     <DialogDescription>
                        <Form {...form}>
                           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                              <FormField
                                 control={form.control}
                                 name="title"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel>Title</FormLabel>
                                       <FormControl>
                                          <Input placeholder="My File" {...field} />
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />

                              <FormField
                                 control={form.control}
                                 name="file"
                                 render={() => (
                                    <FormItem>
                                       <FormLabel>File</FormLabel>
                                       <FormControl>
                                          <Input type="file" {...fileRef} />
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />
                              <Button type="submit">Submit</Button>
                           </form>
                        </Form>
                     </DialogDescription>
                  </DialogHeader>
               </DialogContent>
            </Dialog>
         </div>

         {files?.map((file) => <div key={file._id}>{file.name}</div>)}
      </main>
   );
}
