import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, SearchIcon } from "lucide-react";
import { type Dispatch, type SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
   query: z.string().max(50),
});

export default function seaRchBar({
   //    query,
   setQuery,
}: {
   //    query: string;
   setQuery: Dispatch<SetStateAction<string>>;
}) {
   const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         query: "",
      },
   });

   async function onSubmit(values: z.infer<typeof formSchema>) {
      setQuery(values.query);
   }
   return (
      <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
            <FormField
               control={form.control}
               name="query"
               render={({ field }) => (
                  <FormItem>
                     <FormControl>
                        <Input placeholder="Your file name here" {...field} />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
            />
            <Button size={"sm"} type="submit" disabled={form.formState.isSubmitting}>
               {form.formState.isSubmitting ? (
                  <div className="flex items-center gap-1">
                     <Loader2 className="size-4 animate-spin" />
                     <span>Loading</span>
                  </div>
               ) : (
                  <div className="flex items-center gap-2">
                     <SearchIcon /> <span>Search</span>
                  </div>
               )}
            </Button>
         </form>
      </Form>
   );
}
