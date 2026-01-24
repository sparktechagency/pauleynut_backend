// src/routes/referralRoutes.ts
import { Router } from 'express';
import { inviteUser, makeDonation, getDownline, getImpact, getDownlineStatsTree } from './Referral.Controller';

const router = Router();

router.post('/invites', inviteUser);
router.post('/donations', makeDonation);
router.get('/downline/:phone', getDownline);
router.get('/impact/:phone', getImpact);
// router.get('/downline-stats-tree/:phone', getDownlineStatsTree);

export const referralRoutes = router;
