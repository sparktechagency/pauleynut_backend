import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import auth from "../../middleware/auth";
import { USER_ROLES } from "../../../enums/user";

const router = Router();
router.get("/", auth(USER_ROLES.SUPER_ADMIN), DashboardController.overview)
router.get("/doner", auth(USER_ROLES.SUPER_ADMIN), DashboardController.doner)


export const DashboardRoutes = router;
