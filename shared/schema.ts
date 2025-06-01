import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  discord_id: text("discord_id").unique(),
  age: integer("age"),
  bio: text("bio"),
  reason: text("reason"),
  clan_id: integer("clan_id"),
  avatar: text("avatar"),
  role: text("role").default("member"), // "admin", "clan_owner", "member"
  status: text("status").default("pending"), // "pending", "accepted", "rejected"
  score: integer("score").default(0),
  created_at: timestamp("created_at").defaultNow(),
});

export const clans = pgTable("clans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  banner: text("banner"),
  owner_id: integer("owner_id"),
  created_at: timestamp("created_at").defaultNow(),
});

export const join_requests = pgTable("join_requests", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  clan_id: integer("clan_id").notNull(),
  status: text("status").default("pending"), // "pending", "accepted", "rejected"
  message: text("message"),
  created_at: timestamp("created_at").defaultNow(),
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  clan_id: integer("clan_id"),
  author_id: integer("author_id"),
  title: text("title"),
  content: text("content").notNull(),
  priority: text("priority").default("normal"), // "normal", "important", "urgent"
  created_at: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
});

export const insertClanSchema = createInsertSchema(clans).omit({
  id: true,
  created_at: true,
});

export const insertJoinRequestSchema = createInsertSchema(join_requests).omit({
  id: true,
  created_at: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  created_at: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Clan = typeof clans.$inferSelect;
export type InsertClan = z.infer<typeof insertClanSchema>;
export type JoinRequest = typeof join_requests.$inferSelect;
export type InsertJoinRequest = z.infer<typeof insertJoinRequestSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
