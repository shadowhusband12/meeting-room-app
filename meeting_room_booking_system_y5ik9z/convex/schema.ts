import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  rooms: defineTable({
    name: v.string(),
    capacity: v.number(),
    description: v.string(),
    image: v.string(),
    contactPerson: v.string(),
  }),
  bookings: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    startTime: v.number(),
    endTime: v.number(),
    title: v.string(),
    description: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_room_and_time", ["roomId", "startTime"]),
});
