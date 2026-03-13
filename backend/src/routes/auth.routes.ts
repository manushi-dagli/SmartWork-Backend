import { Router } from "express";
import { requireEmployeeAuth } from "../middleware/employeeAuth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import * as employeeAuthController from "../controllers/employeeAuth.controller.js";

const router = Router();

router.post("/login", asyncHandler(employeeAuthController.employeeLogin));
router.post("/logout", asyncHandler(employeeAuthController.employeeLogout));
router.get("/me", requireEmployeeAuth, asyncHandler(employeeAuthController.getMe));

export const authRoutes = router;
