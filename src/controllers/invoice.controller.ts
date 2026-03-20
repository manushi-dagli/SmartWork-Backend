import type { Response } from "express";
import type { EmployeeAuthRequest } from "../middleware/employeeAuth.js";
import * as repo from "../repositories/invoice.repository.js";
import { sendSuccess, sendCreated, sendError } from "../common/response.js";
import { NotFoundError } from "../common/errors.js";
import { validateBody } from "../validations/validate.js";
import { createInvoiceSchema, updateInvoiceSchema } from "../validations/schemas.js";
import { logger } from "../lib/logger.js";

function idParam(req: EmployeeAuthRequest): string {
  return (req.params.id ?? req.params[0]) as string;
}

export async function list(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: List invoices");
  const list = await repo.listInvoices();
  sendSuccess(res, list);
}

export async function getOne(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: Get invoice by id");
  const id = idParam(req);
  const inv = await repo.getById(id);
  if (!inv) {
    sendError(res, new NotFoundError("Invoice not found"));
    return;
  }
  sendSuccess(res, inv);
}

export async function create(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: Create invoice");
  const body = validateBody(req.body, createInvoiceSchema);
  const inv = await repo.create(body);
  sendCreated(res, inv);
}

export async function update(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: Update invoice");
  const id = idParam(req);
  const body = validateBody(req.body, updateInvoiceSchema);
  const inv = await repo.update(id, body);
  sendSuccess(res, inv);
}
