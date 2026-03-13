import { Router } from "express";
import { requireEmployeeAuth, requireAbility } from "../middleware/employeeAuth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import * as familyController from "../controllers/family.controller.js";

const router = Router();

router.use(requireEmployeeAuth);

router.get("/families", requireAbility("read", "Family"), asyncHandler(familyController.listFamilies));
router.get("/families/:id", requireAbility("read", "Family"), asyncHandler(familyController.getFamily));
router.post("/families", requireAbility("create", "Family"), asyncHandler(familyController.createFamily));
router.patch("/families/:id", requireAbility("update", "Family"), asyncHandler(familyController.updateFamily));
router.delete("/families/:id", requireAbility("delete", "Family"), asyncHandler(familyController.deleteFamily));

export const familyRoutes = router;
