"use client";

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
import { zodResolver } from "@hookform/resolvers/zod";
import { type Doc } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { type Dispatch, type SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "../../../../convex/_generated/api";

type FilePropTypes = Doc<"files"> & { url: string | null; isFavorited: boolean };

const formSchema = z.object({
   name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
   }),
});

export function RenameForm({
   file,
   setIsRenameDialogOpen,
}: {
   file: FilePropTypes;
   setIsRenameDialogOpen: Dispatch<SetStateAction<boolean>>;
}) {
   const renameFile = useMutation(api.files.renameFile);

   const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         name: "",
      },
   });

   async function onSubmit(values: z.infer<typeof formSchema>) {
      try {
         await renameFile({ fileId: file._id, name: values.name });
         form.reset();
         setIsRenameDialogOpen(false);
         toast.success("File renamed successfully.");
      } catch (error) {
         toast.error("Unable to rename the file", {
            description: "You file could not be renamed, Please try again later",
         });
      }
   }

   return (
      <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
               control={form.control}
               name="name"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>Username</FormLabel>
                     <FormControl>
                        <Input placeholder={file.name} {...field} />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
            />
            <Button
               type="submit"
               disabled={form.formState.isSubmitting}
               data-is-submitting={form.formState.isSubmitting}
               className="data-[is-submitting=true]:bg-muted-foreground"
            >
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
