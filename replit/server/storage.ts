import {
  users,
  userWallets,
  videoSubmissions,
  submissionEvents,
  cashoutRequests,
  payoutTransactions,
  binLocations,
  reportsCache,
  type User,
  type UpsertUser,
  type UserWallet,
  type InsertUserWallet,
  type VideoSubmission,
  type InsertVideoSubmission,
  type SubmissionEvent,
  type InsertSubmissionEvent,
  type CashoutRequest,
  type InsertCashoutRequest,
  type BinLocation,
  type InsertBinLocation,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, count, sum, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Wallet operations
  getUserWallet(userId: string): Promise<UserWallet | undefined>;
  createUserWallet(wallet: InsertUserWallet): Promise<UserWallet>;
  updateWalletPoints(userId: string, pointsDelta: number): Promise<void>;
  
  // Video submission operations
  createVideoSubmission(submission: InsertVideoSubmission): Promise<VideoSubmission>;
  getUserSubmissions(userId: string, status?: string): Promise<VideoSubmission[]>;
  getSubmissionsForReview(limit?: number): Promise<VideoSubmission[]>;
  updateSubmissionStatus(id: string, status: string, reviewedBy?: string, rejectionReason?: string, pointsAwarded?: number): Promise<VideoSubmission>;
  getSubmissionById(id: string): Promise<VideoSubmission | undefined>;
  
  // Submission events
  createSubmissionEvent(event: InsertSubmissionEvent): Promise<SubmissionEvent>;
  
  // Cashout operations
  createCashoutRequest(request: InsertCashoutRequest): Promise<CashoutRequest>;
  getUserCashoutRequests(userId: string): Promise<CashoutRequest[]>;
  getPendingCashouts(): Promise<CashoutRequest[]>;
  updateCashoutStatus(id: string, status: string, failureReason?: string): Promise<void>;
  getCashoutById(id: string): Promise<CashoutRequest | undefined>;
  createPayoutTransaction(data: { cashoutRequestId: string; gateway: string; gatewayTxnId?: string; gatewayPayoutId?: string; status: string; amountPaise?: number; beneficiary?: string; rawWebhookJson?: any; failureReason?: string; }): Promise<void>;
  updatePayoutByGatewayId(gatewayPayoutId: string, status: string, rawWebhookJson?: any): Promise<void>;
  lockWalletPoints(userId: string, points: number): Promise<void>;
  settleCashoutByReference(referenceId: string, success: boolean, failureReason?: string): Promise<void>;
  
  // Bin locations
  getBinLocations(): Promise<BinLocation[]>;
  createBinLocation(location: InsertBinLocation): Promise<BinLocation>;
  
  // Analytics
  getAnalyticsData(): Promise<{
    totalUsers: number;
    totalSubmissions: number;
    totalPayouts: number;
    approvedSubmissions: number;
  }>;
  
  // Audit log
  getAuditLog(limit?: number): Promise<SubmissionEvent[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserWallet(userId: string): Promise<UserWallet | undefined> {
    const [wallet] = await db.select().from(userWallets).where(eq(userWallets.userId, userId));
    return wallet;
  }

  async createUserWallet(wallet: InsertUserWallet): Promise<UserWallet> {
    const [created] = await db.insert(userWallets).values(wallet).returning();
    return created;
  }

  async updateWalletPoints(userId: string, pointsDelta: number): Promise<void> {
    await db
      .update(userWallets)
      .set({
        pointsBalance: sql`points_balance + ${pointsDelta}`,
        updatedAt: new Date(),
      })
      .where(eq(userWallets.userId, userId));
  }

  async createVideoSubmission(submission: InsertVideoSubmission): Promise<VideoSubmission> {
    const [created] = await db.insert(videoSubmissions).values(submission).returning();
    return created;
  }

  async getUserSubmissions(userId: string, status?: string): Promise<VideoSubmission[]> {
    const whereClause = status
      ? and(eq(videoSubmissions.userId, userId), eq(videoSubmissions.status, status as any))
      : eq(videoSubmissions.userId, userId);
    return db.select().from(videoSubmissions).where(whereClause).orderBy(desc(videoSubmissions.createdAt));
  }

  async getSubmissionsForReview(limit = 50): Promise<VideoSubmission[]> {
    return db.select()
      .from(videoSubmissions)
      .where(eq(videoSubmissions.status, 'needs_review'))
      .orderBy(desc(videoSubmissions.autoScore), desc(videoSubmissions.createdAt))
      .limit(limit);
  }

  async updateSubmissionStatus(
    id: string, 
    status: string, 
    reviewedBy?: string, 
    rejectionReason?: string, 
    pointsAwarded?: number
  ): Promise<VideoSubmission> {
    const updateData: any = {
      status: status as any,
      reviewedAt: new Date(),
    };
    
    if (reviewedBy) updateData.reviewedBy = reviewedBy;
    if (rejectionReason) updateData.rejectionReason = rejectionReason;
    if (pointsAwarded !== undefined) updateData.pointsAwarded = pointsAwarded;
    
    const [updated] = await db
      .update(videoSubmissions)
      .set(updateData)
      .where(eq(videoSubmissions.id, id))
      .returning();
    
    return updated;
  }

  async getSubmissionById(id: string): Promise<VideoSubmission | undefined> {
    const [submission] = await db.select().from(videoSubmissions).where(eq(videoSubmissions.id, id));
    return submission;
  }

  async createSubmissionEvent(event: InsertSubmissionEvent): Promise<SubmissionEvent> {
    const [created] = await db.insert(submissionEvents).values(event).returning();
    return created;
  }

  async createCashoutRequest(request: InsertCashoutRequest): Promise<CashoutRequest> {
    const [created] = await db.insert(cashoutRequests).values(request).returning();
    return created;
  }

  async getUserCashoutRequests(userId: string): Promise<CashoutRequest[]> {
    return db.select()
      .from(cashoutRequests)
      .where(eq(cashoutRequests.userId, userId))
      .orderBy(desc(cashoutRequests.createdAt));
  }

  async getPendingCashouts(): Promise<CashoutRequest[]> {
    return db.select()
      .from(cashoutRequests)
      .where(eq(cashoutRequests.status, 'pending'))
      .orderBy(desc(cashoutRequests.createdAt));
  }

  async updateCashoutStatus(id: string, status: string, failureReason?: string): Promise<void> {
    const updateData: any = {
      status: status as any,
      updatedAt: new Date(),
    };
    
    if (failureReason) updateData.failureReason = failureReason;
    
    await db
      .update(cashoutRequests)
      .set(updateData)
      .where(eq(cashoutRequests.id, id));
  }

  async getCashoutById(id: string): Promise<CashoutRequest | undefined> {
    const [row] = await db.select().from(cashoutRequests).where(eq(cashoutRequests.id, id));
    return row;
  }

  async createPayoutTransaction(data: { cashoutRequestId: string; gateway: string; gatewayTxnId?: string; gatewayPayoutId?: string; status: string; amountPaise?: number; beneficiary?: string; rawWebhookJson?: any; failureReason?: string; }): Promise<void> {
    await db.insert(payoutTransactions).values({
      cashoutRequestId: data.cashoutRequestId,
      gateway: data.gateway,
      gatewayTxnId: data.gatewayTxnId,
      gatewayPayoutId: data.gatewayPayoutId,
      status: data.status as any,
      amountPaise: data.amountPaise,
      beneficiary: data.beneficiary,
      failureReason: data.failureReason,
      rawWebhookJson: data.rawWebhookJson,
    });
  }

  async updatePayoutByGatewayId(gatewayPayoutId: string, status: string, rawWebhookJson?: any): Promise<void> {
    await db.update(payoutTransactions)
      .set({ status: status as any, rawWebhookJson, updatedAt: new Date() })
      .where(eq(payoutTransactions.gatewayPayoutId, gatewayPayoutId));
  }

  async lockWalletPoints(userId: string, points: number): Promise<void> {
    await db.update(userWallets)
      .set({
        pointsBalance: sql`points_balance - ${points}`,
        lockedPoints: sql`locked_points + ${points}`,
        updatedAt: new Date(),
      })
      .where(eq(userWallets.userId, userId));
  }

  async settleCashoutByReference(referenceId: string, success: boolean, failureReason?: string): Promise<void> {
    const [row] = await db.select().from(cashoutRequests).where(eq(cashoutRequests.id, referenceId));
    if (!row) return;
    const userId = row.userId;
    if (success) {
      // debit locked points
      await db.update(userWallets)
        .set({ lockedPoints: sql`locked_points - ${row.pointsUsed}`, updatedAt: new Date() })
        .where(eq(userWallets.userId, userId));
      await this.updateCashoutStatus(referenceId, 'succeeded');
    } else {
      // refund locked points
      await db.update(userWallets)
        .set({
          pointsBalance: sql`points_balance + ${row.pointsUsed}`,
          lockedPoints: sql`locked_points - ${row.pointsUsed}`,
          updatedAt: new Date(),
        })
        .where(eq(userWallets.userId, userId));
      await this.updateCashoutStatus(referenceId, 'failed', failureReason);
    }
  }

  async getBinLocations(): Promise<BinLocation[]> {
    return db.select().from(binLocations).where(eq(binLocations.active, true));
  }

  async createBinLocation(location: InsertBinLocation): Promise<BinLocation> {
    const [created] = await db.insert(binLocations).values(location).returning();
    return created;
  }

  async getAnalyticsData() {
    const [totalUsersResult] = await db.select({ count: count() }).from(users);
    const [totalSubmissionsResult] = await db.select({ count: count() }).from(videoSubmissions);
    const [totalPayoutsResult] = await db.select({ sum: sum(cashoutRequests.cashAmount) }).from(cashoutRequests).where(eq(cashoutRequests.status, 'succeeded'));
    const [approvedSubmissionsResult] = await db.select({ count: count() }).from(videoSubmissions).where(eq(videoSubmissions.status, 'approved'));

    return {
      totalUsers: totalUsersResult?.count || 0,
      totalSubmissions: totalSubmissionsResult?.count || 0,
      totalPayouts: Number(totalPayoutsResult?.sum || 0),
      approvedSubmissions: approvedSubmissionsResult?.count || 0,
    };
  }

  async getAuditLog(limit = 100): Promise<SubmissionEvent[]> {
    return db.select()
      .from(submissionEvents)
      .orderBy(desc(submissionEvents.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
