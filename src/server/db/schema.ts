import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  decimal,
  date,
  timestamp,
  jsonb,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ─── profiles ───────────────────────────────────────────────────────────────

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique(), // Clerk user ID
  email: text("email"),
  fullName: text("full_name"),
  companyName: text("company_name"),
  avatarUrl: text("avatar_url"),
  proposalsUsed: integer("proposals_used").notNull().default(0),
  isPremium: boolean("is_premium").notNull().default(false),
  subscriptionPlan: text("subscription_plan").default("free"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  anonymized: boolean("anonymized").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── proposals ──────────────────────────────────────────────────────────────

export const proposals = pgTable("proposals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  clientId: uuid("client_id"),
  projectType: text("project_type").notNull(),
  projectConfig: jsonb("project_config").notNull(),
  pricingResult: jsonb("pricing_result").notNull(),
  proposalData: jsonb("proposal_data").notNull(),
  shareToken: text("share_token").unique(),
  isPublic: boolean("is_public").default(false),
  clientSignedAt: timestamp("client_signed_at", { withTimezone: true }),
  clientSignature: text("client_signature"),
  brandingSnapshot: jsonb("branding_snapshot"),
  documentDetails: jsonb("document_details"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── clients ────────────────────────────────────────────────────────────────

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── branding_settings ──────────────────────────────────────────────────────

export const brandingSettings = pgTable("branding_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique(),
  logoUrl: text("logo_url"),
  companyName: text("company_name"),
  tagline: text("tagline"),
  primaryColor: text("primary_color").default("#6366f1"),
  secondaryColor: text("secondary_color").default("#8b5cf6"),
  website: text("website"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── proposal_templates ─────────────────────────────────────────────────────

export const proposalTemplates = pgTable("proposal_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  projectConfig: jsonb("project_config").notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── proposal_views ─────────────────────────────────────────────────────────

export const proposalViews = pgTable("proposal_views", {
  id: uuid("id").primaryKey().defaultRandom(),
  proposalId: uuid("proposal_id")
    .notNull()
    .references(() => proposals.id, { onDelete: "cascade" }),
  viewerIp: text("viewer_ip"),
  viewerUserAgent: text("viewer_user_agent"),
  viewedAt: timestamp("viewed_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── subscriptions ──────────────────────────────────────────────────────────

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    plan: text("plan").notNull().default("free"),
    status: text("status").notNull().default("active"),
    currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId)]
);

// ─── payment_history ────────────────────────────────────────────────────────

export const paymentHistory = pgTable("payment_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  subscriptionId: uuid("subscription_id").references(() => subscriptions.id),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull(),
  providerReference: text("provider_reference"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── time_entries ───────────────────────────────────────────────────────────

export const timeEntries = pgTable("time_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  proposalId: uuid("proposal_id").references(() => proposals.id, { onDelete: "set null" }),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
  description: text("description").notNull(),
  hours: decimal("hours", { precision: 10, scale: 2 }).notNull(),
  date: date("date").notNull().default(sql`CURRENT_DATE`),
  billable: boolean("billable").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── contact_submissions ────────────────────────────────────────────────────

export const contactSubmissions = pgTable("contact_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  respondedAt: timestamp("responded_at", { withTimezone: true }),
});

// ─── rate_limits ────────────────────────────────────────────────────────────

export const rateLimits = pgTable(
  "rate_limits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    identifier: text("identifier").notNull(),
    action: text("action").notNull(),
    requestCount: integer("request_count").notNull().default(1),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.identifier, t.action), index("idx_rate_limits_lookup").on(t.identifier, t.action)]
);

// ─── Type exports ────────────────────────────────────────────────────────────

export type Profile = typeof profiles.$inferSelect;
export type Proposal = typeof proposals.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type BrandingSettings = typeof brandingSettings.$inferSelect;
export type ProposalTemplate = typeof proposalTemplates.$inferSelect;
export type ProposalView = typeof proposalViews.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type TimeEntry = typeof timeEntries.$inferSelect;
