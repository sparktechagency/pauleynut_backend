import express from 'express';
import { campaignController } from './campaign.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import parseFileData from '../../middleware/parseFileData';
import { FOLDER_NAMES } from '../../../enums/files';
import validateRequest from '../../middleware/validateRequest';
import { campaignValidation } from './campaign.validation';
import parseMultipleFileData from '../../middleware/parseMultipleFiledata';

const router = express.Router();

router.post(
     '/',
     auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
     fileUploadHandler(),
     // parseFileData(FOLDER_NAMES.IMAGE),
     parseMultipleFileData(FOLDER_NAMES.IMAGES),
     validateRequest(campaignValidation.createCampaignZodSchema),
     campaignController.createCampaign,
);

router.get('/', campaignController.getAllCampaigns);

router.get('/unpaginated', campaignController.getAllUnpaginatedCampaigns);

router.get('/app/internalTrackingId/campaign/:id', campaignController.getCampaignInternalTrackingIdById);
router.delete('/hard-delete/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), campaignController.hardDeleteCampaign);

router.post(
     '/invite-donate/:campaignId',
     auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
     validateRequest(campaignValidation.invitePeopleToCampaignZodSchema),
     campaignController.invitePeopleToCampaign,
);

router.post(
     '/alert/:campaignId',
     auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
     validateRequest(campaignValidation.alertAboutCampaignZodSchema),
     campaignController.alertAboutCampaign,
);

router.get('/cause/:id', campaignController.getCauseOfCampaignById);
router.patch(
     '/:id',
     fileUploadHandler(),
     parseMultipleFileData(FOLDER_NAMES.IMAGES),
     auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
     // validateRequest(campaignValidation.updateCampaignZodSchema),
     campaignController.updateCampaign,
);
router.get('/:id', campaignController.getCampaignById);
router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), campaignController.deleteCampaign);

export const campaignRoutes = router;
