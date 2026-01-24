// src/controllers/ReferralController.ts
import { Request, Response } from 'express';
import { ReferralService } from './Referral.Service';

const referralService = new ReferralService();

export const inviteUser = async (req: Request, res: Response) => {
     try {
          const { parentPhone, newPhone, campaignId } = req.body;
          const newReferral = await referralService.invite(parentPhone, newPhone, campaignId);
          res.status(201).json(newReferral);
     } catch (error: any) {
          res.status(400).json({ error: error.message });
     }
};

export const makeDonation = async (req: Request, res: Response) => {
     try {
          const { phone, campaignId, amount } = req.body;
          await referralService.donate(phone, campaignId, amount);
          res.status(200).json({ message: 'Donation successful' });
     } catch (error: any) {
          res.status(400).json({ error: error.message });
     }
};

export const getDownline = async (req: Request, res: Response) => {
     try {
          const { phone } = req.params;
          const { campaignId } = req.query;

          if (typeof campaignId !== 'string') {
               return res.status(400).json({ error: 'campaignId must be a string' });
          }

          const stats = await referralService.getDownlineStats(phone, campaignId);
          res.json(stats);
     } catch (error: any) {
          res.status(500).json({ error: error.message });
     }
};

export const getImpact = async (req: Request, res: Response) => {
     try {
          const { phone } = req.params;
          const { campaignId } = req.query;

          if (typeof campaignId !== 'string') {
               return res.status(400).json({ error: 'campaignId must be a string' });
          }

          const impact = await referralService.getPersonalImpact(phone, campaignId);
          res.json(impact);
     } catch (error: any) {
          res.status(500).json({ error: error.message });
     }
};

export const getDownlineStatsTree = async (req: Request, res: Response) => {
     try {
          const { phone } = req.params;
          let { maxLevels, campaignId } = req.query;

          if (typeof campaignId !== 'string') {
               return res.status(400).json({ error: 'campaignId must be a string' });
          }
          const stats = await referralService.getDownlineStatsTree(phone, campaignId, Number(maxLevels));
          res.json(stats);
     } catch (error: any) {
          res.status(500).json({ error: error.message });
     }
};
