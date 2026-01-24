import express from 'express';
import { UserRouter } from '../app/modules/user/user.route';
import { UserLevelRouter } from '../app/modules/user/userLevel.routes';
import { AuthRouter } from '../app/modules/auth/auth.route';
import { campaignRoutes } from '../app/modules/campaign/campaign.route';
import { ContentRoutes } from '../app/modules/content/content.routes';
import { DashboardRoutes } from '../app/modules/Dashboard/dashboard.route';
import { TransactionRoutes } from '../app/modules/Transaction/Transaction.route';
import { InvitationHistoryRoutes } from '../app/modules/InvitationHistory/InvitationHistory.route';
import { PrivacyPolicyRouter } from '../app/modules/Settings/SettingRoute';
import { referralRoutes } from '../app/modules/Referral/Referral.Routes';

const router = express.Router();
const routes = [
     {
          path: '/auth',
          route: AuthRouter,
     },
     {
          path: '/users',
          route: UserRouter,
     },
     {
          path: '/users-level',
          route: UserLevelRouter,
     },
     {
          path: '/campaign',
          route: campaignRoutes,
     },
     {
          path: '/content',
          route: ContentRoutes,
     },
     {
          path: '/dashboard',
          route: DashboardRoutes,
     },
     {
          path: '/transactions',
          route: TransactionRoutes,
     },
     {
          path: '/invitation-history',
          route: InvitationHistoryRoutes,
     },
     {
          path: '/privacy-policy',
          route: PrivacyPolicyRouter,
     },
     {
          path: '/referral',
          route: referralRoutes,
     },
];

routes.forEach((element) => {
     if (element?.path && element?.route) {
          router.use(element?.path, element?.route);
     }
});

export default router;
