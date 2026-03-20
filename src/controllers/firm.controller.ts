import type { Response } from "express";
import type { EmployeeAuthRequest } from "../middleware/employeeAuth.js";
import * as firmService from "../services/firm.service.js";
import { sendSuccess, sendCreated, sendError } from "../common/response.js";
import { validateBody } from "../validations/validate.js";
import { createFirmSchema, updateFirmSchema } from "../validations/schemas.js";
import { logger } from "../lib/logger.js";
export async function listFirms(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: GET /api/firms");
  const firms = await firmService.listFirms();
  sendSuccess(res, firms);
}

export async function getFirm(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: GET /api/firms/:id");
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  const firm = await firmService.getFirmById(id);
  sendSuccess(res, firm);
}

export async function createFirm(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: POST /api/firms");
  try {
    const body = validateBody(req.body, createFirmSchema);
    const firm = await firmService.createFirm(body);
    sendCreated(res, firm);
  } catch (e) {
    sendError(res, e as Error);
  }
}

export async function updateFirm(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: PATCH /api/firms/:id");
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  try {
    const body = validateBody(req.body, updateFirmSchema);
    const firm = await firmService.updateFirm(id, body);
    sendSuccess(res, firm);
  } catch (e) {
    sendError(res, e as Error);
  }
}

export async function deleteFirm(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: DELETE /api/firms/:id");
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  await firmService.deleteFirm(id);
  sendSuccess(res, { deleted: true });
}
