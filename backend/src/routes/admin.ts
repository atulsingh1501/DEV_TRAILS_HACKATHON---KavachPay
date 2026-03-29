import express, { type Response } from 'express';
import { authMiddleware, type AuthRequest } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import prisma from '../prismaClient.js';

const router = express.Router();

// GET /api/admin/stats - Global Dashboard Overview
router.get('/stats', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const activePolicies = await prisma.policy.count({ where: { status: 'ACTIVE' } });
    
    const premiumAgg = await prisma.policy.aggregate({
      _sum: { premiumPaid: true }
    });
    
    const payoutAgg = await prisma.claim.aggregate({
      _sum: { payoutAmount: true }
    });

    const highRiskClaims = await prisma.claim.count({
      where: { fraudScore: { gte: 0.6 } }
    });

    const totalClaims = await prisma.claim.count();
    const fraudRate = totalClaims > 0 ? (highRiskClaims / totalClaims) * 100 : 0;

    res.json({
      totalUsers,
      activePolicies,
      totalPremiumCollected: premiumAgg._sum.premiumPaid || 0,
      totalPayouts: payoutAgg._sum.payoutAmount || 0,
      fraudRate: parseFloat(fraudRate.toFixed(2)),
      highRiskClaims
    });
  } catch (error) {
    console.error('Admin Stats Error:', error);
    res.status(500).json({ error: 'Failed to fetch admin statistics.' });
  }
});

// GET /api/admin/claims - Detailed Claim List for Review
router.get('/claims', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const claims = await prisma.claim.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            city: true,
            email: true,
          }
        },
        policy: {
          select: {
            planTier: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch global claim list.' });
  }
});

// PUT /api/admin/claims/:id/status - Approve or Reject a Claim
router.put('/claims/:id/status', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reviewerNotes } = req.body;

    if (!['PAID', 'REJECTED', 'REVIEW'].includes(status)) {
      res.status(400).json({ error: 'Invalid claim status provided.' });
      return;
    }

    const updatedClaim = await prisma.claim.update({
      where: { id: id as string },
      data: {
        status,
        reviewerNotes,
        updatedAt: new Date()
      }
    });

    res.json(updatedClaim);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update claim adjudication.' });
  }
});

export default router;
