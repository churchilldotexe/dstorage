"use client";

import { FileCardAction } from "@/app/dashboard/_components/file-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formattedDate } from "@/lib/utils";
import { type ColumnDef } from "@tanstack/react-table";
import { type Doc, type Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

function UserCell({ userId }: { userId: Id<"users"> }) {
   const userProfile = useQuery(api.users.getUserProfile, { userId });
   return (
      <div className="flex items-center gap-2 ">
         <Avatar className="size-6">
            <AvatarImage src={userProfile?.image} />
            <AvatarFallback>CN</AvatarFallback>
         </Avatar>

         <div className="line-clamp-1 grow-0">{userProfile?.name}</div>
      </div>
   );
}

export const columns: Array<
   ColumnDef<Doc<"files"> & { url: string | null; isFavorited: boolean }>
> = [
   {
      accessorKey: "name",
      header: "Name",
   },
   {
      accessorKey: "type",
      header: "Type",
   },
   {
      header: "User",
      cell: ({ row }) => {
         return <UserCell userId={row.original.userId} />;
      },
   },
   {
      header: "Uploaded On",
      cell: ({ row }) => {
         return <div>{formattedDate(row.original._creationTime)}</div>;
      },
   },
   {
      header: "Actions",
      cell: ({ row }) => {
         return (
            <div>
               <FileCardAction file={row.original} />
            </div>
         );
      },
   },
];
