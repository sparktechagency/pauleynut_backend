import express from 'express';
import { UserRouter } from '../app/modules/user/user.route';
import { AuthRouter } from '../app/modules/auth/auth.route';
import { campaignRoutes } from '../app/modules/campaign/campaign.route';
import { ContentRoutes } from '../app/modules/content/content.routes';

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
          path: '/campaign',
          route: campaignRoutes,
     },
     {
          path: '/content',
          route: ContentRoutes,
     },
];

routes.forEach((element) => {
     if (element?.path && element?.route) {
          router.use(element?.path, element?.route);
     }
});

export default router;
