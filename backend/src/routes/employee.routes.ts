import { Router } from "express";
import { requireEmployeeAuth, requireAbility } from "../middleware/employeeAuth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import * as employeeController from "../controllers/employee.controller.js";

const router = Router();

router.use(requireEmployeeAuth);

router.get("/employees", requireAbility("read", "Employee"), asyncHandler(employeeController.listEmployees));
router.get("/employees/check-username", requireAbility("read", "Employee"), asyncHandler(employeeController.checkUsername));
router.get("/employees/:id", requireAbility("read", "Employee"), asyncHandler(employeeController.getEmployee));
router.post("/employees", requireAbility("create", "Employee"), asyncHandler(employeeController.createEmployee));
router.patch("/employees/:id", requireAbility("update", "Employee"), asyncHandler(employeeController.updateEmployee));
router.delete("/employees/:id", requireAbility("delete", "Employee"), asyncHandler(employeeController.deleteEmployee));

export const employeeRoutes = router;
