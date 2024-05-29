"use client";

import { columns } from "@/app/dashboard/_components/columns";
import { FileCard } from "@/app/dashboard/_components/file-card";
import { DataTable } from "@/app/dashboard/_components/file-table";
import SearchBar from "@/app/dashboard/_components/search-bar";
import { UploadButton } from "@/app/dashboard/_components/upload-button";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
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

   const files = useQuery(
      api.files.getFiles,
      AuthId !== "" ? { AuthId, query, favorites: showFavoritesOnly, deletedFilesOnly } : "skip"
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

         {isLoading && (
            <div className="m-auto flex size-fit flex-col items-center justify-center">
               <Loader2 className="size-32 animate-spin text-gray-700" />
               <span className="text-xl font-medium text-gray-950">Loading</span>
            </div>
         )}

         {files?.length === 0 && <PlaceHolder />}

         {!isLoading && modifiedFiles?.length > 0 && (
            <Fragment>
               <DataTable columns={columns} data={modifiedFiles} />
               <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"></div>
               {modifiedFiles?.map((file) => <FileCard key={file._id} file={file} />)}
            </Fragment>
         )}
      </main>
   );
}
