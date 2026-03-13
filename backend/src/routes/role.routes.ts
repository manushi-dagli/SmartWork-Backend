import { Router } from "express";
import { requireEmployeeAuth, requireAbility } from "../middleware/employeeAuth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import * as roleController from "../controllers/role.controller.js";

const router = Router();

router.use(requireEmployeeAuth);

router.get("/roles", requireAbility("read", "Role"), asyncHandler(roleController.listRoles));
router.get("/roles/:id", requireAbility("read", "Role"), asyncHandler(roleController.getRole));
router.post("/roles", requireAbility("create", "Role"), asyncHandler(roleController.createRole));
router.patch("/roles/:id", requireAbility("update", "Role"), asyncHandler(roleController.updateRole));
router.delete("/roles/:id", requireAbility("delete", "Role"), asyncHandler(roleController.deleteRole));

export const roleRoutes = router;
