import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("rooms").collect();
  },
});

export const updateContactPerson = mutation({
  args: {
    roomId: v.id("rooms"),
    contactPerson: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.roomId, { contactPerson: args.contactPerson });
  },
});

export const initialize = mutation({
  args: {},
  handler: async (ctx) => {
    const rooms = [
      {
        name: "Everest",
        capacity: 12,
        description: "Large conference room",
        image: "https://images.unsplash.com/photo-1431440869543-efaf3388c585?auto=format&fit=crop&w=1000&q=80",
        contactPerson: "Sarah Johnson"
      },
      {
        name: "Kilimanjaro",
        capacity: 8,
        description: "Medium meeting room",
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80",
        contactPerson: "Michael Chen"
      },
      {
        name: "Alps",
        capacity: 6,
        description: "Cozy meeting space",
        image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=80",
        contactPerson: "Emma Davis"
      },
      {
        name: "Andes",
        capacity: 10,
        description: "Presentation room",
        image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=80",
        contactPerson: "Alex Martinez"
      },
      {
        name: "Rockies",
        capacity: 4,
        description: "Small meeting room",
        image: "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1000&q=80",
        contactPerson: "Lisa Wong"
      },
      {
        name: "Himalayas",
        capacity: 15,
        description: "Board room",
        image: "https://images.unsplash.com/photo-1497366858526-0766cadbe8fa?auto=format&fit=crop&w=1000&q=80",
        contactPerson: "David Smith"
      },
    ];

    for (const room of rooms) {
      await ctx.db.insert("rooms", room);
    }
  },
});
