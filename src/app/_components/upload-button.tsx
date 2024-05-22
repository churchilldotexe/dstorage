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
import { type Doc } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "../../../convex/_generated/api";

const formSchema = z.object({
   title: z.string().min(2).max(50),
   file: z
      .custom<FileList>((val) => val instanceof FileList, "Required")
      .refine((files) => files.length > 0, "Required"),
});

export function UploadButton() {
   const [isFileDiaglogOpen, setIsFileDiaglogOpen] = useState<boolean>(false);

   const user = useAuth();
   const hasUser = user.userId === null || user.userId === undefined;
   const hasOrgId = user.orgId === null || user.orgId === undefined;

   let AuthId = "";
   if (!hasOrgId) {
      AuthId = user.orgId;
   } else if (!hasUser) {
      AuthId = user.userId;
   }

   const createFile = useMutation(api.files.createFile);
   const generateUploadUrl = useMutation(api.files.generateUploadUrl);

   const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         title: "",
         file: undefined,
      },
   });

   const fileRef = form.register("file");

   async function onSubmit(values: z.infer<typeof formSchema>) {
      if (AuthId === "") return;
      if (values.file[0] === undefined) return;

      try {
         const postUrl = await generateUploadUrl();

         const fileType = values.file[0].type;
         const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": fileType },
            body: values.file[0],
         });

         // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
         const { storageId } = await result.json();

         const types = {
            "image/png": "image",
            "image/jpg": "image",
            "image/webp": "image",
            "image/bmp": "image",
            "application/pdf": "pdf",
            "text/csc": "csv",
         } as Record<string, Doc<"files">["type"]>;

         await createFile({
            name: values.title,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            fileId: storageId,
            AuthId,
            type: types[fileType]!,
         });

         form.reset();
         setIsFileDiaglogOpen(false);
         toast.success("File successfully uploaded", {
            description: "Everyone can now view your file",
         });
      } catch (error) {
         toast.error("Something went wrong", {
            description: "Your file could not be uploaded, try again later",
         });
      }
   }

   return (
      <Dialog
         open={isFileDiaglogOpen}
         onOpenChange={(open) => {
            setIsFileDiaglogOpen(open);
            form.reset();
         }}
      >
         <DialogTrigger asChild>
            <Button>Upload File</Button>
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
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                           {form.formState.isSubmitting ? (
                              <div className="flex items-center gap-1">
                                 <Loader2 className="size-4 animate-spin" />
                                 <span>Loading</span>
                              </div>
                           ) : (
                              "Submit"
                           )}
                        </Button>
                     </form>
                  </Form>
               </DialogDescription>
            </DialogHeader>
         </DialogContent>
      </Dialog>
   );
}
