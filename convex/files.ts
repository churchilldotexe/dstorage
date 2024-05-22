import { ConvexError, v } from "convex/values";
import { type Id } from "./_generated/dataModel";
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
   args: { AuthId: v.string(), query: v.string(), favorites: v.optional(v.boolean()) },
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
      } else if (Boolean(args.favorites)) {
         const user = await ctx.db
            .query("users")
            .withIndex("by_tokenIdentifier", (q) =>
               q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .first();

         if (user === null) return filesWithUrl;

         const favorites = await ctx.db
            .query("favorites")
            .withIndex("by_userId_orgId_fileId", (q) =>
               q.eq("userId", user._id).eq("orgId", args.AuthId)
            )
            .collect();

         return (await filesWithUrl).filter((file) =>
            favorites.some((favorite) => favorite.fileId === file._id)
         );
      } else {
         return filesWithUrl;
      }
   },
});

async function hasAccessToFile(ctx: QueryCtx | MutationCtx, fileId: Id<"files">) {
   const identity = await ctx.auth.getUserIdentity();

   if (identity === null) return null;

   const file = await ctx.db.get(fileId);

   if (file === null) return null;

   const hasAccess = await hasAccessToOrg(ctx, identity.tokenIdentifier, file.AuthId);

   if (!hasAccess) return null;

   const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

   if (user === null) return null;

   return { user, file };
}

export const deleteFile = mutation({
   args: { fileId: v.id("files") },
   async handler(ctx, args) {
      const access = await hasAccessToFile(ctx, args.fileId);

      if (access === null) {
         throw new ConvexError("no access to file");
      }

      await ctx.db.delete(args.fileId);
   },
});

export const toggleFavorites = mutation({
   args: { fileId: v.id("files") },
   async handler(ctx, args) {
      const access = await hasAccessToFile(ctx, args.fileId);

      if (access === null) {
         throw new ConvexError("no access to file");
      }
      const { file, user } = access;

      const favorite = await ctx.db
         .query("favorites")
         .withIndex("by_userId_orgId_fileId", (q) =>
            q.eq("userId", user._id).eq("orgId", file.AuthId).eq("fileId", file._id)
         )
         .first();

      if (favorite === null) {
         await ctx.db.insert("favorites", {
            fileId: file._id,
            orgId: file.AuthId,
            userId: user._id,
         });
      } else {
         await ctx.db.delete(favorite._id);
      }
   },
});
