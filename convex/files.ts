import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { fileTypes } from "./schema";
import { getUser } from "./users";

async function hasAccessToOrg(
   ctx: QueryCtx | MutationCtx,
   tokenIdentifier: string,
   AuthId: string
) {
   const user = await getUser(ctx, tokenIdentifier);

   const hasAccess = user.orgIds.includes(AuthId) || user.tokenIdentifier.includes(AuthId);
   return hasAccess;
}

export const generateUploadUrl = mutation(async (ctx) => {
   const identity = await ctx.auth.getUserIdentity();

   if (identity === null) {
      throw new ConvexError("You must be logged in to upload a file");
   }

   const storage = await ctx.storage.generateUploadUrl();
   return storage;
});

export const createFile = mutation({
   args: {
      name: v.string(),
      fileId: v.id("_storage"),
      AuthId: v.string(),
      type: fileTypes,
   },

   async handler(ctx, args) {
      const identity = await ctx.auth.getUserIdentity();

      if (identity === null) throw new ConvexError("Please Login to upload a file");

      const hasAccess = await hasAccessToOrg(ctx, identity.tokenIdentifier, args.AuthId);

      if (!hasAccess) {
         throw new ConvexError("You don't have access to this Organization");
      }

      await ctx.db.insert("files", {
         name: args.name,
         AuthId: args.AuthId,
         fileId: args.fileId,
         type: args.type,
      });
   },
});

export const getFiles = query({
   args: { AuthId: v.string(), query: v.string() },
   async handler(ctx, args) {
      const identity = await ctx.auth.getUserIdentity();

      if (identity === null) {
         return [];
      }
      const hasAccess = await hasAccessToOrg(ctx, identity.tokenIdentifier, args.AuthId);

      if (!hasAccess) {
         return [];
      }

      const files = await ctx.db
         .query("files")
         .withIndex("byAuthId", (q) => q.eq("AuthId", args.AuthId))
         .collect();

      const filesWithUrl = Promise.all(
         files.map(async (file) => ({
            ...file,
            url: await ctx.storage.getUrl(file.fileId),
         }))
      );

      if (args.query !== "") {
         return (await filesWithUrl).filter((file) =>
            file.name.toLocaleLowerCase().includes(args.query.toLocaleLowerCase())
         );
      } else {
         return filesWithUrl;
      }
   },
});

export const deleteFile = mutation({
   args: { fileId: v.id("files") },
   async handler(ctx, args) {
      const identity = await ctx.auth.getUserIdentity();

      if (identity === null) throw new ConvexError("Please Login to upload a file");

      const file = await ctx.db.get(args.fileId);

      if (file === null) throw new ConvexError("This file does not exists");

      const hasAccess = await hasAccessToOrg(ctx, identity.tokenIdentifier, file.AuthId);

      if (!hasAccess) {
         throw new ConvexError("You don't have access to this Organization");
      }

      await ctx.db.delete(args.fileId);
   },
});
