import type { Response } from "express";
import type { EmployeeAuthRequest } from "../middleware/employeeAuth.js";
import * as repo from "../repositories/payment.repository.js";
import { sendSuccess, sendCreated, sendError } from "../common/response.js";
import { NotFoundError } from "../common/errors.js";
import { validateBody } from "../validations/validate.js";
import { createPaymentSchema, updatePaymentSchema } from "../validations/schemas.js";
import { logger } from "../lib/logger.js";

function idParam(req: EmployeeAuthRequest): string {
  return (req.params.id ?? req.params[0]) as string;
}

export async function listByInvoice(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  logger.info("Controller: List payments by invoice");
  const invoiceId = (req.params.invoiceId ?? req.params[0]) as string;
  const list = await repo.listByInvoice(invoiceId);
  sendSuccess(res, list);
}

export async function getOne(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: Get payment by id");
  const id = idParam(req);
  const pay = await repo.getById(id);
  if (!pay) {
    sendError(res, new NotFoundError("Payment not found"));
    return;
  }
  sendSuccess(res, pay);
}

export async function create(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: Create payment");
  const body = validateBody(req.body, createPaymentSchema);
  const pay = await repo.create(body);
  sendCreated(res, pay);
}

export async function update(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: Update payment");
  const id = idParam(req);
  const body = validateBody(req.body, updatePaymentSchema);
  const pay = await repo.update(id, body);
  sendSuccess(res, pay);
}
