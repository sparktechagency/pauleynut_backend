import express from 'express';
import { ContentController } from './content.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { ContentValidation } from './content.validation';

const router = express.Router();

router.post('/', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(ContentValidation.createContentValidation), ContentController.createContent);

router.get('/', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER), ContentController.getContent);

router.patch('/', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(ContentValidation.updateContentValidation), ContentController.updateContent);

export const ContentRoutes = router;
