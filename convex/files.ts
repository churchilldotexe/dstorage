import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createFile = mutation({
   args: {
      name: v.string(),
   },
   async handler(ctx, args) {
      const identity = await ctx.auth.getUserIdentity();

      if (identity === null) {
         throw new Error("Please log in to upload a file");
      }

      await ctx.db.insert("files", {
         name: args.name,
      });
   },
});

export const getFiles = query({
   args: {},
   async handler(ctx) {
      const identity = await ctx.auth.getUserIdentity();

      if (identity === null) {
         return [];
      }

      return ctx.db.query("files").collect();
   },
});
