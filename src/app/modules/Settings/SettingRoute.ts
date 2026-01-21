import { Router } from 'express';
import { SettingController } from './SettingController';


const router = Router();


router.put("/", SettingController.createTerms);
router.get("/", SettingController.getAllPrivacyPolicy);
router.
    route("/:id")
    .get(SettingController.getPrivacyPolicy)
    .patch(SettingController.updateSetting)
    .delete(SettingController.deletePrivacyPolicy)


export const PrivacyPolicyRouter = router;