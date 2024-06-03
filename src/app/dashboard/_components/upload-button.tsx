"use client";

import ImagePreview from "@/app/dashboard/_components/image-preview";
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
import { useReducer, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "../../../../convex/_generated/api";

const MAX_FILE_SIZE = 4 * 1024 * 1024;

const formSchema = z.object({
   title: z.string().min(2).max(50),
   files: z
      .custom<FileList>((val) => val instanceof FileList, "Required")
      .refine((files) => files.length > 0, "Required")
      .refine((files) => files.length <= 5, "You can upload up to 5 files at a time")
      .refine(
         (files) => Array.from(files).every((file) => file.size <= MAX_FILE_SIZE),
         "Each file must be less than or equal to 5mb"
      ),
});

type State = {
   previews: string[];
   objectUrls: string[];
};

type Action =
   | { type: "SET_PREVIEWS"; payload: string[] }
   | { type: "SET_OBJECT_URLS"; payload: string[] }
   | { type: "RESET" };

const initialState: State = {
   objectUrls: [],
   previews: [],
};

function reducer(state: State, action: Action): State {
   switch (action.type) {
      case "SET_PREVIEWS":
         return { ...state, previews: action.payload };
      case "SET_OBJECT_URLS":
         return { ...state, objectUrls: action.payload };
      case "RESET":
         return initialState;
      default:
         return state;
   }
}

export function UploadButton() {
   const [isFileDiaglogOpen, setIsFileDiaglogOpen] = useState<boolean>(false);
   const [state, dispatch] = useReducer(reducer, initialState);
   const { objectUrls, previews } = state;

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
         files: undefined,
      },
   });

   const fileRef = form.register("files");

   function handleChange(event: ChangeEvent<HTMLInputElement>) {
      const files = event.target.files;
      if (files !== null) {
         objectUrls.forEach((url) => {
            URL.revokeObjectURL(url);
         });
         const previewUrl = Array.from(files).map((file) => URL.createObjectURL(file));
         dispatch({ type: "SET_PREVIEWS", payload: previewUrl });
         dispatch({ type: "SET_OBJECT_URLS", payload: previewUrl });
      }
   }

   async function onSubmit(values: z.infer<typeof formSchema>) {
      if (AuthId === "") return;
      if (values.files[0] === undefined) return;

      try {
         for (const file of values.files) {
            console.log("file ", file);
            const postUrl = await generateUploadUrl();
            const fileType = file.type;
            const result = await fetch(postUrl, {
               method: "POST",
               headers: { "Content-Type": fileType },
               body: file,
            });

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const { storageId } = await result.json();

            const types = {
               "image/png": "image",
               "image/jpg": "image",
               "image/jpeg": "image",
               "image/webp": "image",
               "image/bmp": "image",
               "application/pdf": "pdf",
               "text/csc": "csv",
            } as Record<string, Doc<"files">["type"]>;

            const fileNameOnly = file.name.split(".").slice(0, -1).join(".");
            console.log("fileNameOnly", fileNameOnly);

            await createFile({
               // name: values.title,
               name: file.name,
               // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
               fileId: storageId,
               AuthId,
               type: types[fileType]!,
            });
         }

         objectUrls.forEach((url) => {
            URL.revokeObjectURL(url);
         });
         dispatch({ type: "RESET" });

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
            dispatch({ type: "RESET" });
            objectUrls.forEach((url) => {
               URL.revokeObjectURL(url);
            });
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
                           name="files"
                           render={() => (
                              <FormItem>
                                 <FormLabel>Files</FormLabel>
                                 <FormControl>
                                    <Input
                                       type="file"
                                       multiple
                                       {...fileRef}
                                       onChange={handleChange}
                                    />
                                 </FormControl>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />

                        {previews.length > 0 && <ImagePreview previews={previews} />}

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
