import { ConvexError, v } from "convex/values";
import { internalMutation, type MutationCtx, type QueryCtx } from "./_generated/server";
import { role } from "./schema";

export async function getUser(ctx: QueryCtx | MutationCtx, tokenIdentifier: string) {
   const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .first();

   if (user === null) {
      throw new ConvexError("User must be defined");
   }

   return user;
}

export const createUser = internalMutation({
   args: { tokenIdentifier: v.string() },
   async handler(ctx, args) {
      await ctx.db.insert("users", {
         tokenIdentifier: args.tokenIdentifier,
         orgIds: [],
      });
   },
});

export const addOrgIdToUser = internalMutation({
   args: { tokenIdentifier: v.string(), orgId: v.string(), role },
   async handler(ctx, args) {
      const user = await getUser(ctx, args.tokenIdentifier);

      await ctx.db.patch(user._id, {
         orgIds: [...user.orgIds, { orgId: args.orgId, role: args.role }],
      });
   },
});

export const updateRoleInOrgForUser = internalMutation({
   args: { tokenIdentifier: v.string(), orgId: v.string(), role },
   async handler(ctx, args) {
      const user = await getUser(ctx, args.tokenIdentifier);

      const organization = user.orgIds.find((org) => org.orgId === args.orgId);

      if (organization === undefined) {
         throw new ConvexError("Expected an org but wasn't found during update");
      }

      organization.role = args.role;

      await ctx.db.patch(user._id, {
         orgIds: user.orgIds,
      });
   },
});
