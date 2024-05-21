import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createFile = mutation({
   args: {
      name: v.string(),
      AuthId: v.string(),
   },

   async handler(ctx, args) {
      const identity = await ctx.auth.getUserIdentity();

      if (identity === null) {
         throw new ConvexError("Please log in to upload a file");
      }

      await ctx.db.insert("files", {
         name: args.name,
         AuthId: args.AuthId,
      });
   },
});

export const getFiles = query({
   args: { AuthId: v.string() },
   async handler(ctx, args) {
      const identity = await ctx.auth.getUserIdentity();

      if (identity === null) {
         return [];
      }

      return ctx.db
         .query("files")
         .withIndex("byAuthId", (q) => q.eq("AuthId", args.AuthId))
         .collect();
   },
});
