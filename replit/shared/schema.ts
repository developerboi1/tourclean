import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['tourist', 'moderator', 'council']);
export const submissionStatusEnum = pgEnum('submission_status', ['queued', 'auto_verified', 'needs_review', 'approved', 'rejected']);
export const cashoutStatusEnum = pgEnum('cashout_status', ['pending', 'initiated', 'succeeded', 'failed', 'canceled']);
export const payoutStatusEnum = pgEnum('payout_status', ['pending', 'initiated', 'succeeded', 'failed']);

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default('tourist').notNull(),
  kycStatus: varchar("kyc_status").default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userWallets = pgTable("user_wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  pointsBalance: integer("points_balance").default(0).notNull(),
  cashBalance: decimal("cash_balance", { precision: 10, scale: 2 }).default('0.00').notNull(),
  lockedAmount: decimal("locked_amount", { precision: 10, scale: 2 }).default('0.00').notNull(),
  lockedPoints: integer("locked_points").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const binLocations = pgTable("bin_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  lat: decimal("lat", { precision: 10, scale: 8 }).notNull(),
  lng: decimal("lng", { precision: 11, scale: 8 }).notNull(),
  radiusM: integer("radius_m").default(500).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const videoSubmissions = pgTable("video_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  s3Key: varchar("s3_key").notNull(),
  thumbKey: varchar("thumb_key"),
  durationS: integer("duration_s"),
  sizeBytes: integer("size_bytes"),
  deviceHash: varchar("device_hash"),
  gpsLat: decimal("gps_lat", { precision: 10, scale: 8 }),
  gpsLng: decimal("gps_lng", { precision: 11, scale: 8 }),
  recordedAt: timestamp("recorded_at"),
  binIdGuess: varchar("bin_id_guess").references(() => binLocations.id),
  autoScore: integer("auto_score").default(0),
  status: submissionStatusEnum("status").default('queued').notNull(),
  rejectionReason: text("rejection_reason"),
  pointsAwarded: integer("points_awarded").default(0),
  wasteType: varchar("waste_type"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const submissionEvents = pgTable("submission_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  submissionId: varchar("submission_id").references(() => videoSubmissions.id, { onDelete: 'cascade' }).notNull(),
  actorId: varchar("actor_id").references(() => users.id),
  eventType: varchar("event_type").notNull(),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cashoutRequests = pgTable("cashout_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  pointsUsed: integer("points_used").notNull(),
  cashAmount: decimal("cash_amount", { precision: 10, scale: 2 }).notNull(),
  method: varchar("method").notNull(),
  destinationRef: varchar("destination_ref").notNull(),
  status: cashoutStatusEnum("status").default('pending').notNull(),
  lockedPoints: integer("locked_points").default(0).notNull(),
  rateCents: integer("rate_cents").default(0).notNull(),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const payoutTransactions = pgTable("payout_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cashoutRequestId: varchar("cashout_request_id").references(() => cashoutRequests.id, { onDelete: 'cascade' }).notNull(),
  gateway: varchar("gateway").notNull(),
  gatewayTxnId: varchar("gateway_txn_id"),
  gatewayPayoutId: varchar("gateway_payout_id"),
  status: payoutStatusEnum("status").default('pending').notNull(),
  amountPaise: integer("amount_paise"),
  beneficiary: varchar("beneficiary"),
  failureReason: text("failure_reason"),
  rawWebhookJson: jsonb("raw_webhook_json"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reportsCache = pgTable("reports_cache", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key").notNull().unique(),
  json: jsonb("json").notNull(),
  generatedAt: timestamp("generated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  wallet: one(userWallets, {
    fields: [users.id],
    references: [userWallets.userId],
  }),
  submissions: many(videoSubmissions),
  cashoutRequests: many(cashoutRequests),
}));

export const userWalletsRelations = relations(userWallets, ({ one }) => ({
  user: one(users, {
    fields: [userWallets.userId],
    references: [users.id],
  }),
}));

export const videoSubmissionsRelations = relations(videoSubmissions, ({ one, many }) => ({
  user: one(users, {
    fields: [videoSubmissions.userId],
    references: [users.id],
  }),
  bin: one(binLocations, {
    fields: [videoSubmissions.binIdGuess],
    references: [binLocations.id],
  }),
  reviewer: one(users, {
    fields: [videoSubmissions.reviewedBy],
    references: [users.id],
  }),
  events: many(submissionEvents),
}));

export const submissionEventsRelations = relations(submissionEvents, ({ one }) => ({
  submission: one(videoSubmissions, {
    fields: [submissionEvents.submissionId],
    references: [videoSubmissions.id],
  }),
  actor: one(users, {
    fields: [submissionEvents.actorId],
    references: [users.id],
  }),
}));

export const cashoutRequestsRelations = relations(cashoutRequests, ({ one, many }) => ({
  user: one(users, {
    fields: [cashoutRequests.userId],
    references: [users.id],
  }),
  transactions: many(payoutTransactions),
}));

export const payoutTransactionsRelations = relations(payoutTransactions, ({ one }) => ({
  cashoutRequest: one(cashoutRequests, {
    fields: [payoutTransactions.cashoutRequestId],
    references: [cashoutRequests.id],
  }),
}));

// Types and schemas
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertUserWallet = typeof userWallets.$inferInsert;
export type UserWallet = typeof userWallets.$inferSelect;

export type InsertVideoSubmission = typeof videoSubmissions.$inferInsert;
export type VideoSubmission = typeof videoSubmissions.$inferSelect;

export type InsertSubmissionEvent = typeof submissionEvents.$inferInsert;
export type SubmissionEvent = typeof submissionEvents.$inferSelect;

export type InsertCashoutRequest = typeof cashoutRequests.$inferInsert;
export type CashoutRequest = typeof cashoutRequests.$inferSelect;

export type InsertBinLocation = typeof binLocations.$inferInsert;
export type BinLocation = typeof binLocations.$inferSelect;

// Insert schemas
export const insertUserWalletSchema = createInsertSchema(userWallets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVideoSubmissionSchema = createInsertSchema(videoSubmissions).omit({ id: true, createdAt: true });
export const insertSubmissionEventSchema = createInsertSchema(submissionEvents).omit({ id: true, createdAt: true });
export const insertCashoutRequestSchema = createInsertSchema(cashoutRequests).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBinLocationSchema = createInsertSchema(binLocations).omit({ id: true, createdAt: true });
