import type { Response } from "express";
import type { EmployeeAuthRequest } from "../middleware/employeeAuth.js";
import * as clientService from "../services/client.service.js";
import { sendSuccess, sendCreated, sendError } from "../common/response.js";
import { validateBody } from "../validations/validate.js";
import { createClientSchema, updateClientSchema } from "../validations/schemas.js";

import { logger } from "../lib/logger.js";
export async function listClients(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: GET /api/clients");
  const clients = await clientService.listClients();
  sendSuccess(res, clients);
}

export async function getClient(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: GET /api/clients/:id");
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  const client = await clientService.getClientById(id);
  sendSuccess(res, client);
}

export async function createClient(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: POST /api/clients");
  try {
    const body = validateBody(req.body, createClientSchema);
    const client = await clientService.createClient(body);
    sendCreated(res, client);
  } catch (e) {
    sendError(res, e as Error);
  }
}

export async function updateClient(req: EmployeeAuthRequest, res: Response): Promise<void> {
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  try {
    const body = validateBody(req.body, updateClientSchema);
    const client = await clientService.updateClient(id, body);
    sendSuccess(res, client);
  } catch (e) {
    sendError(res, e as Error);
  }
}

export async function deleteClient(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: DELETE /api/clients/:id");
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  await clientService.deleteClient(id);
  sendSuccess(res, { deleted: true });
}
