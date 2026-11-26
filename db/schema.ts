import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const enquiries = sqliteTable("agency_enquiries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  requestKey: text("request_key").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  brand: text("brand").notNull().default(""),
  services: text("services").notNull(),
  budget: text("budget").notNull().default(""),
  deadline: text("deadline").notNull().default(""),
  brief: text("brief").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const registrations = sqliteTable(
  "registrations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    originalName: text("original_name").notNull(),
    clanName: text("clan_name").notNull(),
    clanKey: text("clan_key").notNull(),
    phone: text("phone").notNull(),
    phoneKey: text("phone_key").notNull(),
    email: text("email").notNull(),
    emailKey: text("email_key").notNull(),
    socialProfile: text("social_profile").notNull(),
    accessCode: text("access_code").notNull(),
    partnerName: text("partner_name"),
    tentAddon: integer("tent_addon", { mode: "boolean" }).notNull().default(false),
    photoRequested: integer("photo_requested", { mode: "boolean" }).notNull().default(false),
    status: text("status").notNull().default("pending"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("registrations_clan_key_unique").on(table.clanKey),
    uniqueIndex("registrations_email_key_unique").on(table.emailKey),
    uniqueIndex("registrations_phone_key_unique").on(table.phoneKey),
  ],
);
