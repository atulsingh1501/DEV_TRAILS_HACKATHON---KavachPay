import express, { type Response } from 'express';
import { authMiddleware, type AuthRequest } from '../middleware/authMiddleware.js';
import prisma from '../prismaClient.js';
import { calculateConsensus } from '../services/environmentalEngine.js';

const router = express.Router();

/**
 * 🧠 ML Confidence Score Calculation (Adjudication Logic)
 * 
 * This simulates the Model 2 & Model 3 from our README.
 */
function calculateConfidence(activeMinutes: number, ipMatch: boolean, sessionRecency: number) {
  // 1. Work-Proof Score (0.0 - 1.0)
  // Higher active minutes = higher confidence
  const workProofScore = Math.min(activeMinutes / 30, 1.0);

  // 2. Fraud Score (0.0 - 1.0, where 0.0 is Clean)
  let fraudScore = 0.05; // Base tiny risk
  if (!ipMatch) fraudScore += 0.6; // Mismatched IP is a major fraud signal
  if (sessionRecency > 15) fraudScore += 0.3; // If they weren't active recently, it's risky

  return { 
    workProofScore: parseFloat(workProofScore.toFixed(2)), 
    fraudScore: parseFloat(Math.min(fraudScore, 1.0).toFixed(2)) 
  };
}

// SIMULATE DISRUPTION (The Hackathon Presentation Engine 🚀)
router.post('/simulate-disruption', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const userCity = req.user!.city;

    // 1. Fetch User and Active Policy
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        policies: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user || user.policies.length === 0) {
      res.status(403).json({ error: 'No active policy found. Purchase a plan first.' });
      return;
    }

    const policy = user.policies[0];

    // 2. Fetch Latest Work-Proof Session (Step 3)
    const latestSession = await prisma.workSession.findFirst({
      where: { userId: userId },
      orderBy: { startTime: 'desc' }
    });

    // 3. REAL-WORLD ENVIRONMENTAL CONSENSUS (Pillar 2)
    const consensus = await calculateConsensus(userCity);
    const envDisruptionScore = consensus?.disruptionScore || 0.05;
    const evidence = consensus?.evidence || 'No real-time disruption data available.';

    // 4. Run ML Adjudication (Step 5)
    let activeMins = 0;
    let ipMatch = false;
    let recencyMins = 999;

    if (latestSession) {
      activeMins = latestSession.activeMinutes;
      ipMatch = latestSession.ipCity === userCity;
      recencyMins = (new Date().getTime() - new Date(latestSession.startTime).getTime()) / 60000;
    }

    const { workProofScore, fraudScore } = calculateConfidence(activeMins, ipMatch, recencyMins);

    // 5. Final Decision (Consensus + Work Proof)
    // For the hackathon demo, we allow a "Force-Pay" behavior to ensure the demo works even
    // if it's sunny outside, but we clearly log the real consensus results.
    const isRealDisruption = envDisruptionScore > 0.3;
    const claimStatus = (fraudScore < 0.4 && workProofScore > 0.1) ? 'PAID' : 'REVIEW';
    
    const claim = await prisma.claim.create({
      data: {
        userId,
        policyId: policy.id,
        triggerEvent: `CONSENSUS_DETECTION_${userCity.toUpperCase()}`,
        status: claimStatus as any,
        fraudScore,
        workProofScore,
        payoutAmount: claimStatus === 'PAID' ? policy.coverageAmount : 0,
        reviewerNotes: `Real-time Consensus Score: ${envDisruptionScore} | Evidence: ${evidence}`
      }
    });

    res.json({
      success: true,
      claim,
      mlBreakdown: {
        activeMinutes: activeMins,
        ipMatch,
        recencyMins: Math.round(recencyMins),
        envDisruptionScore,
        evidence,
        decision: claimStatus
      }
    });

  } catch (error) {
    console.error('Simulation Error:', error);
    res.status(500).json({ error: 'Failed to process AI adjudication.' });
  }
});

// Fetch Claim History for Dashboard
router.get('/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const claims = await prisma.claim.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch claim history.' });
  }
});

export default router;
