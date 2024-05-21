import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
   files: defineTable({
      name: v.string(),
      AuthId: v.string(),
   }).index("byAuthId", ["AuthId"]),

   users: defineTable({
      tokenIdentifier: v.string(),
      orgIds: v.array(v.string()),
   }).index("by_tokenIdentifier", ["tokenIdentifier"]),
});
