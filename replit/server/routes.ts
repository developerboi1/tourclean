import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertVideoSubmissionSchema, insertCashoutRequestSchema } from "@shared/schema";
import { createPresignedUpload } from "./services/s3";
import { createFundAccount, createPayout, computeWebhookSignature } from "./services/razorpayx";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  },
});

// Middleware to check user role
const requireRole = (roles: string[]) => {
  return async (req: any, res: any, next: any) => {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(userId);
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    req.currentUser = user;
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      // Create user wallet if it doesn't exist
      if (user) {
        const wallet = await storage.getUserWallet(user.id);
        if (!wallet) {
          await storage.createUserWallet({ userId: user.id });
        }
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Tourist routes
  // Presign S3 upload
  app.post('/api/uploads/presign', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { mime, ext } = req.body;
      const presign = await createPresignedUpload(mime, ext, userId);
      res.json(presign);
    } catch (error) {
      console.error("Error presigning upload:", error);
      res.status(500).json({ message: "Failed to presign upload" });
    }
  });
  app.get('/api/submissions', isAuthenticated, requireRole(['tourist', 'moderator', 'council']), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const status = req.query.status as string;
      const submissions = await storage.getUserSubmissions(userId, status);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.post('/api/submissions', isAuthenticated, requireRole(['tourist']), upload.single('video'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "Video file is required" });
      }

      const submissionData = {
        userId,
        s3Key: file.filename, // In production, this would be S3 key
        durationS: parseInt(req.body.duration) || 15,
        sizeBytes: file.size,
        deviceHash: req.body.deviceHash || 'browser',
        gpsLat: req.body.gpsLat ? req.body.gpsLat.toString() : null,
        gpsLng: req.body.gpsLng ? req.body.gpsLng.toString() : null,
        recordedAt: new Date(),
        wasteType: req.body.wasteType,
        status: 'needs_review' as const,
        autoScore: 50, // Basic auto-scoring logic would go here
      };

      const submission = await storage.createVideoSubmission(submissionData);
      
      // Log submission event
      await storage.createSubmissionEvent({
        submissionId: submission.id,
        actorId: userId,
        eventType: 'submitted',
        meta: { wasteType: req.body.wasteType },
      });

      res.json(submission);
    } catch (error) {
      console.error("Error creating submission:", error);
      res.status(500).json({ message: "Failed to create submission" });
    }
  });

  app.get('/api/wallet', isAuthenticated, requireRole(['tourist']), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let wallet = await storage.getUserWallet(userId);
      
      if (!wallet) {
        wallet = await storage.createUserWallet({ userId });
      }
      
      res.json(wallet);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      res.status(500).json({ message: "Failed to fetch wallet" });
    }
  });

  app.post('/api/cashout', isAuthenticated, requireRole(['tourist']), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { pointsUsed, method, destinationRef } = req.body;
      
      // Basic validation
      if (!pointsUsed || pointsUsed < 100) {
        return res.status(400).json({ message: "Minimum 100 points required for cashout" });
      }

      const wallet = await storage.getUserWallet(userId);
      if (!wallet || wallet.pointsBalance < pointsUsed) {
        return res.status(400).json({ message: "Insufficient points balance" });
      }

      // Lock points and compute cash using configurable rate (points->INR)
      const pointsPerCurrencyUnit = parseInt(process.env.POINTS_TO_CURRENCY_RATE || '10', 10); // 100 pts = 10 INR default
      const cashAmountINR = (pointsUsed / (pointsPerCurrencyUnit)).toFixed(2);

      const cashoutRequest = await storage.createCashoutRequest({
        userId,
        pointsUsed,
        cashAmount: cashAmountINR,
        method,
        destinationRef,
        status: 'pending',
        lockedPoints: pointsUsed,
        rateCents: Math.round((Number(cashAmountINR) * 100) / pointsUsed * 100),
      });

      await storage.lockWalletPoints(userId, pointsUsed);
      res.json(cashoutRequest);
    } catch (error) {
      console.error("Error creating cashout request:", error);
      res.status(500).json({ message: "Failed to create cashout request" });
    }
  });
  // Admin initiate payout
  app.post('/api/admin/cashouts/:id/initiate', isAuthenticated, requireRole(['moderator']), async (req: any, res) => {
    try {
      const cashoutId = req.params.id;
      const { beneficiary } = req.body; // { name, upi OR ifsc+account, email, contact }
      const cashout = await storage.getCashoutById(cashoutId);
      if (!cashout) return res.status(404).json({ message: 'Not found' });

      const amountPaise = Math.round(Number(cashout.cashAmount) * 100);
      const { fundAccountId } = await createFundAccount(beneficiary);
      const payout = await createPayout({ fundAccountId, amountPaise, referenceId: cashout.id });
      const txn = await storage.createPayoutTransaction({
        cashoutRequestId: cashout.id,
        gateway: 'razorpayx',
        gatewayTxnId: payout.id,
        gatewayPayoutId: payout.id,
        status: 'initiated',
        amountPaise,
        beneficiary: beneficiary.upi || beneficiary.account,
      });
      await storage.updateCashoutStatus(cashout.id, 'initiated');
      res.json({ payout, transaction: txn });
    } catch (error) {
      console.error('Error initiating payout:', error);
      res.status(500).json({ message: 'Failed to initiate payout' });
    }
  });

  // RazorpayX webhook
  app.post('/api/webhooks/razorpayx', async (req: any, res) => {
    try {
      const signature = req.header('X-Razorpay-Signature');
      const bodyString = JSON.stringify(req.body);
      const expected = computeWebhookSignature(bodyString);
      if (signature !== expected) return res.status(400).json({ message: 'Bad signature' });

      const event = req.body;
      const payout = event?.payload?.payout?.entity;
      if (payout) {
        const statusMap: any = { processed: 'succeeded', reversed: 'failed', cancelled: 'canceled', failed: 'failed', queued: 'initiated' };
        await storage.updatePayoutByGatewayId(payout.id, statusMap[payout.status] || 'pending', req.body);
        if (statusMap[payout.status] === 'succeeded') {
          await storage.settleCashoutByReference(payout.reference_id, true);
        } else if (statusMap[payout.status] === 'failed') {
          await storage.settleCashoutByReference(payout.reference_id, false, payout.failure_reason);
        }
      }
      res.json({ ok: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ message: 'Webhook handling failed' });
    }
  });

  app.get('/api/cashout', isAuthenticated, requireRole(['tourist']), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getUserCashoutRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching cashout requests:", error);
      res.status(500).json({ message: "Failed to fetch cashout requests" });
    }
  });

  // Moderator routes
  app.get('/api/admin/review-queue', isAuthenticated, requireRole(['moderator']), async (req: any, res) => {
    try {
      const submissions = await storage.getSubmissionsForReview();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching review queue:", error);
      res.status(500).json({ message: "Failed to fetch review queue" });
    }
  });

  app.post('/api/admin/submissions/:id/approve', isAuthenticated, requireRole(['moderator']), async (req: any, res) => {
    try {
      const submissionId = req.params.id;
      const moderatorId = req.user.claims.sub;
      const pointsAwarded = req.body.pointsAwarded || 75;

      const submission = await storage.updateSubmissionStatus(
        submissionId,
        'approved',
        moderatorId,
        undefined,
        pointsAwarded
      );

      // Award points to user
      await storage.updateWalletPoints(submission.userId, pointsAwarded);

      // Log approval event
      await storage.createSubmissionEvent({
        submissionId,
        actorId: moderatorId,
        eventType: 'approved',
        meta: { pointsAwarded },
      });

      res.json(submission);
    } catch (error) {
      console.error("Error approving submission:", error);
      res.status(500).json({ message: "Failed to approve submission" });
    }
  });

  app.post('/api/admin/submissions/:id/reject', isAuthenticated, requireRole(['moderator']), async (req: any, res) => {
    try {
      const submissionId = req.params.id;
      const moderatorId = req.user.claims.sub;
      const { reason } = req.body;

      const submission = await storage.updateSubmissionStatus(
        submissionId,
        'rejected',
        moderatorId,
        reason
      );

      // Log rejection event
      await storage.createSubmissionEvent({
        submissionId,
        actorId: moderatorId,
        eventType: 'rejected',
        meta: { reason },
      });

      res.json(submission);
    } catch (error) {
      console.error("Error rejecting submission:", error);
      res.status(500).json({ message: "Failed to reject submission" });
    }
  });

  app.get('/api/admin/audit-log', isAuthenticated, requireRole(['moderator']), async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const events = await storage.getAuditLog(limit);
      res.json(events);
    } catch (error) {
      console.error("Error fetching audit log:", error);
      res.status(500).json({ message: "Failed to fetch audit log" });
    }
  });

  // City Council routes
  app.get('/api/analytics', isAuthenticated, requireRole(['council', 'moderator']), async (req: any, res) => {
    try {
      const data = await storage.getAnalyticsData();
      res.json(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get('/api/bin-locations', isAuthenticated, async (req: any, res) => {
    try {
      const locations = await storage.getBinLocations();
      res.json(locations);
    } catch (error) {
      console.error("Error fetching bin locations:", error);
      res.status(500).json({ message: "Failed to fetch bin locations" });
    }
  });

  // Initialize some bin locations if none exist
  app.post('/api/init-bins', async (req, res) => {
    try {
      const existingBins = await storage.getBinLocations();
      if (existingBins.length === 0) {
        const defaultBins = [
          { name: 'Downtown Recycling Center', lat: '40.7831', lng: '-73.9712', radiusM: 500 },
          { name: 'Central Park Bin #47', lat: '40.7829', lng: '-73.9654', radiusM: 300 },
          { name: 'University Quarter Station', lat: '40.7580', lng: '-73.9855', radiusM: 400 },
          { name: 'Library Recycling Station', lat: '40.7614', lng: '-73.9776', radiusM: 350 },
        ];

        for (const bin of defaultBins) {
          await storage.createBinLocation(bin);
        }
      }
      res.json({ message: 'Bin locations initialized' });
    } catch (error) {
      console.error("Error initializing bins:", error);
      res.status(500).json({ message: "Failed to initialize bin locations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
