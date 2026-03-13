import { Router } from "express";
import { requireEmployeeAuth } from "../middleware/employeeAuth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import * as profileController from "../controllers/profile.controller.js";

const router = Router();

router.get("/profile", requireEmployeeAuth, asyncHandler(profileController.getProfile));
router.patch("/profile", requireEmployeeAuth, asyncHandler(profileController.updateProfile));

export const profileRoutes = router;
