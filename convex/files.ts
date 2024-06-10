import { ConvexError, v } from "convex/values";
import { type Doc, type Id } from "./_generated/dataModel";
import {
   internalMutation,
   mutation,
   query,
   type MutationCtx,
   type QueryCtx,
} from "./_generated/server";
import { fileTypes } from "./schema";
import { getUser } from "./users";

async function hasAccessToOrg(ctx: QueryCtx | MutationCtx, AuthId: string) {
   const identity = await ctx.auth.getUserIdentity();

   if (identity === null) throw new ConvexError("Please Login to upload a file");

   const user = await getUser(ctx, identity.tokenIdentifier);

   const hasAccess =
      user.orgIds.some((item) => item.orgId === AuthId) || user.tokenIdentifier.includes(AuthId);

   if (!Boolean(hasAccess)) return null;

   return { user };
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
      const hasAccess = await hasAccessToOrg(ctx, args.AuthId);

      if (hasAccess === null) {
         throw new ConvexError("You don't have access to this Organization");
      }

      await ctx.db.insert("files", {
         name: args.name,
         AuthId: args.AuthId,
         fileId: args.fileId,
         type: args.type,
         userId: hasAccess.user._id,
      });
   },
});

export const getFiles = query({
   args: {
      AuthId: v.string(),
      query: v.string(),
      favorites: v.optional(v.boolean()),
      deletedFilesOnly: v.optional(v.boolean()),
      type: v.optional(fileTypes),
   },
   async handler(ctx, args) {
      const hasAccess = await hasAccessToOrg(ctx, args.AuthId);

      if (hasAccess === null) {
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
         const favorites = await ctx.db
            .query("favorites")
            .withIndex("by_userId_orgId_fileId", (q) =>
               q.eq("userId", hasAccess.user._id).eq("orgId", args.AuthId)
            )
            .collect();

         return (await filesWithUrl).filter((file) =>
            favorites.some((favorite) => favorite.fileId === file._id)
         );
      } else if (Boolean(args.deletedFilesOnly)) {
         return (await filesWithUrl).filter((file) => file.shouldDelete);
      } else if (Boolean(args.type)) {
         return (await filesWithUrl).filter((file) => file.type === args.type);
      } else {
         return (await filesWithUrl).filter((file) => !Boolean(file.shouldDelete));
      }
   },
});

async function hasAccessToFile(ctx: QueryCtx | MutationCtx, fileId: Id<"files">) {
   const file = await ctx.db.get(fileId);

   if (file === null) return null;

   const hasAccess = await hasAccessToOrg(ctx, file.AuthId);

   if (hasAccess === null) return null;

   return { user: hasAccess.user, file };
}

export const deleteAllFiles = internalMutation({
   args: {},
   async handler(ctx) {
      const files = await ctx.db
         .query("files")
         .withIndex("by_shouldDelete", (q) => q.eq("shouldDelete", true))
         .collect();

      await Promise.all(
         files.map(async (file) => {
            await ctx.storage.delete(file.fileId);
            await ctx.db.delete(file._id);
         })
      );
   },
});

function canDeleteOrRestore(user: Doc<"users">, file: Doc<"files">) {
   const canRestore =
      file.userId === user._id ||
      user.orgIds.find((org) => org.orgId === file.AuthId)?.role === "admin";

   if (!canRestore) {
      throw new ConvexError(
         "You don't have access to delete this file, please contact your admin."
      );
   }
}

export const deleteFile = mutation({
   args: { fileId: v.id("files") },
   async handler(ctx, args) {
      const access = await hasAccessToFile(ctx, args.fileId);

      if (access === null) {
         throw new ConvexError("no access to file");
      }

      canDeleteOrRestore(access.user, access.file);

      await ctx.db.patch(args.fileId, {
         shouldDelete: true,
      });
   },
});

export const restoreFile = mutation({
   args: { fileId: v.id("files") },
   async handler(ctx, args) {
      const access = await hasAccessToFile(ctx, args.fileId);

      if (access === null) {
         throw new ConvexError("no access to file");
      }

      canDeleteOrRestore(access.user, access.file);

      await ctx.db.patch(args.fileId, {
         shouldDelete: false,
      });
   },
});

export const renameFile = mutation({
   args: { fileId: v.id("files"), name: v.string() },
   async handler(ctx, args) {
      const access = await hasAccessToFile(ctx, args.fileId);

      if (access === null) {
         throw new ConvexError("you have no access to file");
      }

      await ctx.db.patch(args.fileId, {
         name: args.name,
      });
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

export const getAllFavorites = query({
   args: { orgId: v.string() },
   async handler(ctx, args) {
      const access = await hasAccessToOrg(ctx, args.orgId);

      if (access === null) {
         return [];
      }
      const { user } = access;

      const favorites = await ctx.db
         .query("favorites")
         .withIndex("by_userId_orgId_fileId", (q) =>
            q.eq("userId", user._id).eq("orgId", args.orgId)
         )
         .collect();

      return favorites;
   },
});

export const getSharedFile = query({
   args: { fileId: v.id("_storage") },
   async handler(ctx, args) {
      const sharedFile = await ctx.db
         .query("sharedFiles")
         .withIndex("by_fileId", (q) => q.eq("fileId", args.fileId))
         .first();

      if (sharedFile === null) throw new ConvexError("No File found or file is not shareable");

      return sharedFile;
   },
});

export const shareFile = mutation({
   args: { fileId: v.id("_storage"), name: v.string(), fileType: fileTypes, url: v.string() },
   async handler(ctx, args) {
      const urlInfo = await ctx.db
         .query("sharedFiles")
         .withIndex("by_fileId", (q) => q.eq("fileId", args.fileId))
         .first();

      if (urlInfo === null) {
         await ctx.db.insert("sharedFiles", {
            fileId: args.fileId,
            name: args.name,
            fileType: args.fileType,
            url: args.url,
         });
      } else {
         await ctx.db.delete(urlInfo._id);
      }
   },
});
