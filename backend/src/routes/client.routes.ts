import { Router } from "express";
import { requireEmployeeAuth, requireAbility } from "../middleware/employeeAuth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import * as clientController from "../controllers/client.controller.js";

const router = Router();

router.use(requireEmployeeAuth);

router.get("/clients", requireAbility("read", "Client"), asyncHandler(clientController.listClients));
router.get("/clients/:id", requireAbility("read", "Client"), asyncHandler(clientController.getClient));
router.post("/clients", requireAbility("create", "Client"), asyncHandler(clientController.createClient));
router.patch("/clients/:id", requireAbility("update", "Client"), asyncHandler(clientController.updateClient));
router.delete("/clients/:id", requireAbility("delete", "Client"), asyncHandler(clientController.deleteClient));

export const clientRoutes = router;
