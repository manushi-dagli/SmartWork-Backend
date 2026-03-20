import type { Response } from "express";
import type { EmployeeAuthRequest } from "../middleware/employeeAuth.js";
import * as familyService from "../services/family.service.js";
import { sendSuccess, sendCreated } from "../common/response.js";
import type { CreateFamilyDto, UpdateFamilyDto } from "../common/types.js";

import { logger } from "../lib/logger.js";
export async function listFamilies(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: GET /api/families");
  const families = await familyService.listFamilies();
  sendSuccess(res, families);
}

export async function getFamily(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: GET /api/families/:id");
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  const family = await familyService.getFamilyById(id);
  sendSuccess(res, family);
}

export async function createFamily(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: POST /api/families");
  const family = await familyService.createFamily(req.body as CreateFamilyDto);
  sendCreated(res, family);
}

export async function updateFamily(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: PATCH /api/families/:id");
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  const family = await familyService.updateFamily(id, req.body as UpdateFamilyDto);
  sendSuccess(res, family);
}

export async function deleteFamily(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: DELETE /api/families/:id");
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  await familyService.deleteFamily(id);
  sendSuccess(res, { deleted: true });
}
