import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import * as superAdminController from "../controllers/superAdmin.controller.js";

const router = Router();

router.post("/super-admin", asyncHandler(superAdminController.createSuperAdmin));

export const superAdminRoutes = router;
