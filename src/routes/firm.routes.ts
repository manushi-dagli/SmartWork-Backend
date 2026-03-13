import { Router } from "express";
import { requireEmployeeAuth, requireAbility } from "../middleware/employeeAuth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import * as firmController from "../controllers/firm.controller.js";

const router = Router();

router.use(requireEmployeeAuth);

router.get("/firms", requireAbility("read", "Firm"), asyncHandler(firmController.listFirms));
router.get("/firms/:id", requireAbility("read", "Firm"), asyncHandler(firmController.getFirm));
router.post("/firms", requireAbility("create", "Firm"), asyncHandler(firmController.createFirm));
router.patch("/firms/:id", requireAbility("update", "Firm"), asyncHandler(firmController.updateFirm));
router.delete("/firms/:id", requireAbility("delete", "Firm"), asyncHandler(firmController.deleteFirm));

export const firmRoutes = router;
