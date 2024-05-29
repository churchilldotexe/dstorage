"use client";

import { columns } from "@/app/dashboard/_components/columns";
import { FileCard } from "@/app/dashboard/_components/file-card";
import { DataTable } from "@/app/dashboard/_components/file-table";
import SearchBar from "@/app/dashboard/_components/search-bar";
import { UploadButton } from "@/app/dashboard/_components/upload-button";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@clerk/nextjs";
import { type Doc } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Grid2X2Icon, Loader2, Rows3Icon } from "lucide-react";
import Image from "next/image";
import { Fragment, useState } from "react";
import { api } from "../../../../convex/_generated/api";

function PlaceHolder() {
   return (
      <div className="flex flex-col items-center justify-center gap-8">
         <div className="relative aspect-video size-full">
            <Image
               alt="A person and a folder image"
               src="/empty.svg"
               fill
               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
         </div>
         <div className="text-center text-2xl font-medium">
            You have no files, Go ahead an upload one now
         </div>
         <UploadButton />
      </div>
   );
}

export default function FilesBrowser({
   title,
   showFavoritesOnly,
   deletedFilesOnly,
}: {
   title: string;
   showFavoritesOnly?: boolean;
   deletedFilesOnly?: boolean;
}) {
   const [query, setQuery] = useState<string>("");
   const [type, setType] = useState<Doc<"files">["type"] | "all">("all");
   const user = useAuth();
   const hasUser = user.userId === null || user.userId === undefined;
   const hasOrgId = user.orgId === null || user.orgId === undefined;

   let AuthId = "";
   if (!hasOrgId) {
      AuthId = user.orgId;
   } else if (!hasUser) {
      AuthId = user.userId;
   }

   const favorites = useQuery(
      api.files.getAllFavorites,
      AuthId !== "" ? { orgId: AuthId } : "skip"
   );

   const selectedType = type === "all" ? undefined : type;

   const files = useQuery(
      api.files.getFiles,
      AuthId !== ""
         ? { AuthId, type: selectedType, query, favorites: showFavoritesOnly, deletedFilesOnly }
         : "skip"
   );

   const modifiedFiles = files?.map((file) => ({
      ...file,
      isFavorited: (favorites ?? []).some((favorite) => favorite.fileId === file._id),
   }));

   const isLoading = modifiedFiles === undefined || favorites === undefined;

   return (
      <main className="container space-y-6 pt-12">
         <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold">{title}</h1>

            <SearchBar setQuery={setQuery} />

            <UploadButton />
         </div>

         <Tabs defaultValue="grid" className="space-y-4">
            <div className="flex items-center justify-between">
               <TabsList>
                  <TabsTrigger value="grid" className="flex items-center gap-2">
                     <Grid2X2Icon /> Grid
                  </TabsTrigger>
                  <TabsTrigger value="table" className="flex items-center gap-2">
                     <Rows3Icon /> Table
                  </TabsTrigger>
               </TabsList>

               <div className="flex items-center gap-2 font-semibold">
                  <label htmlFor="type-select">Type Filter</label>
                  <Select
                     value={type}
                     onValueChange={(newType) => {
                        // @ts-expect-error alreay expected a value
                        setType(newType);
                     }}
                  >
                     <SelectTrigger id="type-select" className="w-[180px] ">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="csv">Csv</SelectItem>
                        <SelectItem value="pdf">Pdf</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
            </div>

            {!isLoading && modifiedFiles?.length > 0 && (
               <Fragment>
                  <TabsContent value="grid" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                     {modifiedFiles?.map((file) => <FileCard key={file._id} file={file} />)}
                  </TabsContent>
                  <TabsContent value="table">
                     <DataTable columns={columns} data={modifiedFiles} />
                  </TabsContent>
               </Fragment>
            )}

            {isLoading && (
               <div className="m-auto flex size-fit flex-col items-center justify-center">
                  <Loader2 className="size-32 animate-spin text-gray-700" />
                  <span className="text-xl font-medium text-gray-950">Loading</span>
               </div>
            )}

            {files?.length === 0 && <PlaceHolder />}
         </Tabs>
      </main>
   );
}
