import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
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

export const createFile = mutation({
   args: {
      name: v.string(),
      AuthId: v.string(),
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
      const hasAccess = await hasAccessToOrg(ctx, identity.tokenIdentifier, args.AuthId);

      if (!hasAccess) {
         return [];
      }

      return ctx.db
         .query("files")
         .withIndex("byAuthId", (q) => q.eq("AuthId", args.AuthId))
         .collect();
   },
});
