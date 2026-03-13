import type { Response } from "express";
import type { EmployeeAuthRequest } from "../middleware/employeeAuth.js";
import * as repo from "../repositories/inquiryConfig.repository.js";
import { sendSuccess, sendCreated } from "../common/response.js";
import { NotFoundError } from "../common/errors.js";

const getId = (req: EmployeeAuthRequest): string =>
  typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";

// Inquiry types (table: inquiry_types)
export async function listInquiryTypes(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const list = await repo.listInquiryTypes();
  sendSuccess(res, list);
}

export async function getInquiryType(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const row = await repo.getInquiryTypeById(getId(req));
  if (!row) throw new NotFoundError("Inquiry type not found");
  sendSuccess(res, row);
}

export async function createInquiryType(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const created = await repo.createInquiryType(req.body);
  sendCreated(res, created);
}

export async function updateInquiryType(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const updated = await repo.updateInquiryType(getId(req), req.body);
  if (!updated) throw new NotFoundError("Inquiry type not found");
  sendSuccess(res, updated);
}

export async function deleteInquiryType(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const deleted = await repo.deleteInquiryType(getId(req));
  if (!deleted) throw new NotFoundError("Inquiry type not found");
  sendSuccess(res, { deleted: true });
}

// Documents (document master)
export async function listDocuments(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const list = await repo.listDocuments();
  sendSuccess(res, list);
}

export async function getDocument(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const row = await repo.getDocumentById(getId(req));
  if (!row) throw new NotFoundError("Document not found");
  sendSuccess(res, row);
}

export async function createDocument(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const created = await repo.createDocument(req.body);
  sendCreated(res, created);
}

export async function updateDocument(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const updated = await repo.updateDocument(getId(req), req.body);
  if (!updated) throw new NotFoundError("Document not found");
  sendSuccess(res, updated);
}

export async function deleteDocument(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const deleted = await repo.deleteDocument(getId(req));
  if (!deleted) throw new NotFoundError("Document not found");
  sendSuccess(res, { deleted: true });
}

// Assignment term templates
export async function listAssignmentTermTemplates(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const list = await repo.listAssignmentTermTemplates();
  sendSuccess(res, list);
}

export async function getAssignmentTermTemplate(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const row = await repo.getAssignmentTermTemplateById(getId(req));
  if (!row) throw new NotFoundError("Assignment term template not found");
  sendSuccess(res, row);
}

export async function createAssignmentTermTemplate(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const created = await repo.createAssignmentTermTemplate(req.body);
  sendCreated(res, created);
}

export async function updateAssignmentTermTemplate(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const updated = await repo.updateAssignmentTermTemplate(getId(req), req.body);
  if (!updated) throw new NotFoundError("Assignment term template not found");
  sendSuccess(res, updated);
}

export async function deleteAssignmentTermTemplate(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const deleted = await repo.deleteAssignmentTermTemplate(getId(req));
  if (!deleted) throw new NotFoundError("Assignment term template not found");
  sendSuccess(res, { deleted: true });
}

// Payment term templates
export async function listPaymentTermTemplates(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const list = await repo.listPaymentTermTemplates();
  sendSuccess(res, list);
}

export async function getPaymentTermTemplate(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const row = await repo.getPaymentTermTemplateById(getId(req));
  if (!row) throw new NotFoundError("Payment term template not found");
  sendSuccess(res, row);
}

export async function createPaymentTermTemplate(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const created = await repo.createPaymentTermTemplate(req.body);
  sendCreated(res, created);
}

export async function updatePaymentTermTemplate(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const updated = await repo.updatePaymentTermTemplate(getId(req), req.body);
  if (!updated) throw new NotFoundError("Payment term template not found");
  sendSuccess(res, updated);
}

export async function deletePaymentTermTemplate(
  req: EmployeeAuthRequest,
  res: Response
): Promise<void> {
  const deleted = await repo.deletePaymentTermTemplate(getId(req));
  if (!deleted) throw new NotFoundError("Payment term template not found");
  sendSuccess(res, { deleted: true });
}
