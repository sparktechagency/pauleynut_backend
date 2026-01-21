import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import { UserLevelController } from './userLevel.controller';
import auth from '../../middleware/auth';

const router = express.Router();

// User level calculation routes
router.post('/calculate', auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.SUPER_ADMIN), UserLevelController.calculateAndUpdateUserLevel);
router.get('/status', auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.SUPER_ADMIN), UserLevelController.getUserLevelStatus);

export const UserLevelRouter = router;
