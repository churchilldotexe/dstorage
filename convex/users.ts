import { ConvexError, v } from "convex/values";
import { internalMutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
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
   args: { tokenIdentifier: v.string(), name: v.string(), image: v.string() },
   async handler(ctx, args) {
      await ctx.db.insert("users", {
         tokenIdentifier: args.tokenIdentifier,
         name: args.name,
         image: args.image,
         orgIds: [],
      });
   },
});

export const updateUser = internalMutation({
   args: { tokenIdentifier: v.string(), name: v.string(), image: v.string() },
   async handler(ctx, args) {
      const user = await ctx.db
         .query("users")
         .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
         .first();

      if (user === null) throw new ConvexError("no user found with this token");

      await ctx.db.patch(user._id, {
         name: args.name,
         image: args.image,
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

export const getUserProfile = query({
   args: { userId: v.id("users") },
   async handler(ctx, args) {
      const user = await ctx.db.get(args.userId);

      if (user === null) throw new ConvexError("No user Found");

      return {
         name: user.name,
         image: user.image,
      };
   },
});

export const getMe = query({
   args: {},
   async handler(ctx) {
      const identity = await ctx.auth.getUserIdentity();

      if (identity === null) return null;

      const user = await getUser(ctx, identity.tokenIdentifier);
      return user;
   },
});
