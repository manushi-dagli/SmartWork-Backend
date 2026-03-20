import type { Response } from "express";
import type { EmployeeAuthRequest } from "../middleware/employeeAuth.js";
import * as inquiryRepo from "../repositories/inquiry.repository.js";
import * as inquiryConfigRepo from "../repositories/inquiryConfig.repository.js";
import { sendSuccess, sendCreated, sendError } from "../common/response.js";
import { NotFoundError } from "../common/errors.js";
import { validateBody } from "../validations/validate.js";
import {
  createInquirySchema,
  updateInquirySchema,
  setInquiryDocumentsSchema,
} from "../validations/schemas.js";

import { logger } from "../lib/logger.js";
function inquiryId(req: EmployeeAuthRequest): string {
  const id = req.params.id ?? req.params[0];
  return typeof id === "string" ? id : "";
}

export async function listInquiries(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: GET /api/inquiries");
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const allowed = ["PENDING", "ACCEPTED", "REJECTED"];
  const filters =
    status && allowed.includes(status) ? { status: status as inquiryRepo.InquiryStatus } : undefined;
  const list = await inquiryRepo.listInquiries(filters);
  sendSuccess(res, list);
}

export async function getInquiry(req: EmployeeAuthRequest, res: Response): Promise<void> {
  const id = inquiryId(req);
  logger.info(`Controller: GET /api/inquiries/:id ${id}`);
  const inquiry = await inquiryRepo.getInquiryWithDocuments(id);
  if (!inquiry) {
    sendError(res, new NotFoundError("Inquiry not found"));
    return;
  }
  sendSuccess(res, inquiry);
}

export async function createInquiry(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: POST /api/inquiries");
  try {
    const body = validateBody(req.body, createInquirySchema);
    const inquiry = await inquiryRepo.createInquiry(body);
    sendCreated(res, inquiry);
  } catch (e) {
    sendError(res, e as Error);
  }
}

export async function updateInquiry(req: EmployeeAuthRequest, res: Response): Promise<void> {
  const id = inquiryId(req);
  logger.info(`Controller: PATCH /api/inquiries/:id ${id}`);
  try {
    const body = validateBody(req.body, updateInquirySchema);
    const inquiry = await inquiryRepo.updateInquiry(id, body);
    if (!inquiry) {
      sendError(res, new NotFoundError("Inquiry not found"));
      return;
    }
    sendSuccess(res, inquiry);
  } catch (e) {
    sendError(res, e as Error);
  }
}

export async function setInquiryDocuments(req: EmployeeAuthRequest, res: Response): Promise<void> {
  const id = inquiryId(req);
  logger.info(`Controller: POST /api/inquiries/:id/documents ${id}`);
  try {
    const { documentMasterIds: ids } = validateBody(req.body, setInquiryDocumentsSchema);
    const existing = await inquiryRepo.getInquiryById(id);
    if (!existing) {
      sendError(res, new NotFoundError("Inquiry not found"));
      return;
    }
    await inquiryRepo.setInquiryDocuments(id, ids);
    const inquiry = await inquiryRepo.getInquiryWithDocuments(id);
    sendSuccess(res, inquiry ?? existing);
  } catch (e) {
    sendError(res, e as Error);
  }
}

export async function getInquiryDocuments(req: EmployeeAuthRequest, res: Response): Promise<void> {
  const id = inquiryId(req);
  logger.info(`Controller: GET /api/inquiries/:id/documents ${id}`);
  const existing = await inquiryRepo.getInquiryById(id);
  if (!existing) {
    sendError(res, new NotFoundError("Inquiry not found"));
    return;
  }
  const docs = await inquiryRepo.getDocumentsForInquiry(id);
  sendSuccess(res, docs);
}

export async function markInquirySent(req: EmployeeAuthRequest, res: Response): Promise<void> {
  const id = inquiryId(req);
  logger.info(`Controller: POST /api/inquiries/:id/send ${id}`);
  const body = (req.body as { emailed?: boolean; whatsapp?: boolean }) ?? {};
  const existing = await inquiryRepo.getInquiryById(id);
  if (!existing) {
    sendError(res, new NotFoundError("Inquiry not found"));
    return;
  }
  const dto: inquiryRepo.UpdateInquiryDto = {};
  if (body.emailed) dto.emailedAt = new Date();
  if (body.whatsapp) dto.whatsappSentAt = new Date();
  const inquiry = await inquiryRepo.updateInquiry(id, dto);
  sendSuccess(res, inquiry ?? existing);
}

export async function acceptInquiry(req: EmployeeAuthRequest, res: Response): Promise<void> {
  const id = inquiryId(req);
  logger.info(`Controller: POST /api/inquiries/:id/accept ${id}`);
  try {
    const inquiry = await inquiryRepo.acceptInquiry(id);
    sendSuccess(res, inquiry);
  } catch (e) {
    sendError(res, e as Error);
  }
}

export async function rejectInquiry(req: EmployeeAuthRequest, res: Response): Promise<void> {
  const id = inquiryId(req);
  logger.info(`Controller: POST /api/inquiries/:id/reject ${id}`);
  try {
    const inquiry = await inquiryRepo.rejectInquiry(id);
    sendSuccess(res, inquiry);
  } catch (e) {
    sendError(res, e as Error);
  }
}

// Staff read-only config (no requireSuperAdmin)
export async function listInquiryTypesForStaff(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: GET /api/inquiries/inquiry-types");
  const list = await inquiryConfigRepo.listInquiryTypes();
  sendSuccess(res, list);
}

export async function listDocumentsForStaff(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: GET /api/inquiries/documents");
  const list = await inquiryConfigRepo.listDocuments();
  sendSuccess(res, list);
}

export async function getDocumentsByInquiryType(req: EmployeeAuthRequest, res: Response): Promise<void> {
  const inquiryTypeId = typeof req.params.inquiryTypeId === "string" ? req.params.inquiryTypeId : "";
  logger.info(`Controller: GET /api/inquiries/documents-by-type/:inquiryTypeId ${inquiryTypeId}`);
  const list = await inquiryRepo.getDocumentsByInquiryType(inquiryTypeId);
  sendSuccess(res, list);
}

export async function listAssignmentTermTemplatesForStaff(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: GET /api/inquiries/assignment-term-templates");
  const list = await inquiryConfigRepo.listAssignmentTermTemplates();
  sendSuccess(res, list);
}

export async function listPaymentTermTemplatesForStaff(req: EmployeeAuthRequest, res: Response): Promise<void> {
  logger.info("Controller: GET /api/inquiries/payment-term-templates");
  const list = await inquiryConfigRepo.listPaymentTermTemplates();
  sendSuccess(res, list);
}
