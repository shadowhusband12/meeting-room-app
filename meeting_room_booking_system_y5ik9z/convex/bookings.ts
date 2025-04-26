import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    roomId: v.id("rooms"),
    startTime: v.number(),
    endTime: v.number(),
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check for conflicts
    const conflicts = await ctx.db
      .query("bookings")
      .withIndex("by_room_and_time", (q) =>
        q
          .eq("roomId", args.roomId)
          .gte("startTime", args.startTime - 1000 * 60 * 30)
          .lte("startTime", args.endTime + 1000 * 60 * 30)
      )
      .collect();

    if (conflicts.length > 0) {
      throw new Error("Time slot already booked");
    }

    return await ctx.db.insert("bookings", {
      ...args,
      userId,
    });
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const roomIds = new Set(bookings.map((b) => b.roomId));
    const rooms = await Promise.all(
      Array.from(roomIds).map((id) => ctx.db.get(id))
    );
    const roomMap = new Map(rooms.map((r) => [r!._id, r!]));

    return bookings.map((booking) => ({
      ...booking,
      room: roomMap.get(booking.roomId),
    }));
  },
});

export const cancel = mutation({
  args: {
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");
    if (booking.userId !== userId) throw new Error("Not authorized");

    await ctx.db.delete(args.bookingId);
  },
});

export const listByRoom = query({
  args: {
    roomId: v.id("rooms"),
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_room_and_time", (q) =>
        q
          .eq("roomId", args.roomId)
          .gte("startTime", args.startTime)
          .lte("startTime", args.endTime)
      )
      .collect();
  },
});
