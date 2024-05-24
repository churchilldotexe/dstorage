import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const fileTypes = v.union(v.literal("image"), v.literal("csv"), v.literal("pdf"));

export const role = v.union(v.literal("admin"), v.literal("member"));

export default defineSchema({
   files: defineTable({
      name: v.string(),
      type: fileTypes,
      AuthId: v.string(),
      fileId: v.id("_storage"),
      shouldDelete: v.optional(v.boolean()),
   }).index("byAuthId", ["AuthId"]),

   favorites: defineTable({
      fileId: v.id("files"),
      orgId: v.string(),
      userId: v.id("users"),
   }).index("by_userId_orgId_fileId", ["userId", "orgId", "fileId"]),

   users: defineTable({
      tokenIdentifier: v.string(),
      orgIds: v.array(
         v.object({
            orgId: v.string(),
            role,
         })
      ),
   }).index("by_tokenIdentifier", ["tokenIdentifier"]),
});
