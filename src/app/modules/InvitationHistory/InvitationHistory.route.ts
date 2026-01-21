import express from 'express';
import { InvitationHistoryController } from './InvitationHistory.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middleware/validateRequest';
import { InvitationHistoryValidation } from './InvitationHistory.validation';

const router = express.Router();

router.post('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(InvitationHistoryValidation.createInvitationHistoryZodSchema), InvitationHistoryController.createInvitationHistory);

router.get('/', InvitationHistoryController.getAllInvitationHistorys);

router.get('/unpaginated', InvitationHistoryController.getAllUnpaginatedInvitationHistorys);

router.delete('/hard-delete/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), InvitationHistoryController.hardDeleteInvitationHistory);

router.patch(
     '/:id',
     auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
     validateRequest(InvitationHistoryValidation.updateInvitationHistoryZodSchema),
     InvitationHistoryController.updateInvitationHistory,
);

router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), InvitationHistoryController.deleteInvitationHistory);

router.get('/:id', InvitationHistoryController.getInvitationHistoryById);

export const InvitationHistoryRoutes = router;
