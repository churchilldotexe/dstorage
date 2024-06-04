"use client";

import ImagePreview from "@/app/dashboard/_components/image-preview";
import { Button } from "@/components/ui/button";
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
import { type Doc, type Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import {
   useReducer,
   useRef,
   useState,
   type Dispatch,
   type DragEvent,
   type SetStateAction,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "../../../../convex/_generated/api";

const MAX_FILE_SIZE = 4 * 1024 * 1024;

const formSchema = z.object({
   files: z
      .custom<FileList>((val) => val instanceof FileList, "Required")
      .refine((files) => files.length > 0, "Required")
      .refine((files) => files.length <= 5, "You can upload up to 5 files at a time")
      .refine(
         (files) => Array.from(files).every((file) => file.size <= MAX_FILE_SIZE),
         "Each file must be less than or equal to 4mb"
      ),
});

const types = {
   "image/png": "image",
   "image/jpg": "image",
   "image/jpeg": "image",
   "image/webp": "image",
   "image/bmp": "image",
   "application/pdf": "pdf",
   "text/csv": "csv",
} as Record<string, Doc<"files">["type"]>;

export type PreviewsArrayType = Array<{ name: string; url: string }>;

type State = {
   previews: PreviewsArrayType;
   objectUrls: string[];
};

type Action =
   | { type: "SET_PREVIEWS"; payload: PreviewsArrayType }
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

export function FileForm({
   setObjectUrls,
   setIsFileDiaglogOpen,
}: {
   setIsFileDiaglogOpen: Dispatch<SetStateAction<boolean>>;
   setObjectUrls: Dispatch<SetStateAction<string[]>>;
}) {
   const [state, dispatch] = useReducer(reducer, initialState);
   const { objectUrls, previews } = state;
   const [isDragging, setIsDragging] = useState<boolean>(false);
   const InputRef = useRef<HTMLInputElement>(null);

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
         files: undefined,
      },
   });

   const fileRef = form.register("files");

   function handleChange(files: FileList | null) {
      if (files !== null) {
         objectUrls.forEach((url) => {
            URL.revokeObjectURL(url);
         });
         const url = Array.from(files).map((file) => URL.createObjectURL(file));
         const previewUrl = Array.from(files).map((file) => {
            return { url: URL.createObjectURL(file), name: file.name };
         });
         dispatch({ type: "SET_PREVIEWS", payload: previewUrl });
         dispatch({ type: "SET_OBJECT_URLS", payload: url });
         setObjectUrls(url);
         form.setValue("files", files, { shouldValidate: true });

         if (InputRef.current !== null && InputRef.current !== undefined) {
            InputRef.current.files = files;
         }
      }
   }

   function handleDrop(event: DragEvent<HTMLDivElement>) {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
      handleChange(event.dataTransfer.files);
   }

   function handleDragOver(event: DragEvent<HTMLDivElement>) {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(true);
   }

   function handleDragLeave(event: DragEvent<HTMLDivElement>) {
      event.stopPropagation();
      setIsDragging(false);
   }

   async function onSubmit(values: z.infer<typeof formSchema>) {
      if (AuthId === "") return;
      if (values.files[0] === undefined) return;

      try {
         for (const file of values.files) {
            const postUrl = await generateUploadUrl();
            const fileType = file.type;
            const result = await fetch(postUrl, {
               method: "POST",
               headers: { "Content-Type": fileType },
               body: file,
            });

            const { storageId } = (await result.json()) as { storageId: Id<"_storage"> };

            const fileNameOnly = file.name.split(".").slice(0, -1).join(".");

            await createFile({
               name: fileNameOnly,
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
      <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
               control={form.control}
               name="files"
               render={() => (
                  <FormItem>
                     <FormLabel>Files</FormLabel>
                     <FormControl>
                        <label htmlFor="file-input">
                           <div
                              onDrop={handleDrop}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              className={`space-y-4 border-2 border-dashed p-4 ${isDragging ? "border-blue-500" : "border-gray-300"}`}
                           >
                              <Input
                                 type="file"
                                 multiple
                                 {...fileRef}
                                 ref={InputRef}
                                 onChange={(e) => {
                                    handleChange(e.target.files);
                                 }}
                                 id="file-input"
                              />
                              {previews.length > 0 ? null : (
                                 <div>
                                    <p>Drag and drop files here, or click to select files.</p>
                                    <p>
                                       Please upload <strong>up to 5 files</strong> at a time, each
                                       not exceeding <strong>4MB</strong>.
                                    </p>
                                 </div>
                              )}

                              {previews.length > 0 && <ImagePreview previews={previews} />}
                           </div>
                        </label>
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
   );
}
