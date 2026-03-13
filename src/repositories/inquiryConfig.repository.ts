import { eq, asc } from "drizzle-orm";
import { db } from "../config/database.js";
import {
  inquiryTypes,
  documentMaster,
  assignmentTermTemplates,
  paymentTermTemplates,
} from "../db/schema.js";
import type {
  InquiryTypeInsert,
  InquiryTypeRow,
  DocumentMasterInsert,
  DocumentMasterRow,
  AssignmentTermTemplateInsert,
  AssignmentTermTemplateRow,
  PaymentTermTemplateInsert,
  PaymentTermTemplateRow,
} from "../db/schema.js";

export type InquiryType = InquiryTypeRow;
export type DocumentMaster = DocumentMasterRow;
export type AssignmentTermTemplate = AssignmentTermTemplateRow;
export type PaymentTermTemplate = PaymentTermTemplateRow;

// Inquiry types (table: inquiry_types)
export async function listInquiryTypes(): Promise<InquiryType[]> {
  return db.select().from(inquiryTypes).orderBy(asc(inquiryTypes.name));
}

export async function getInquiryTypeById(id: string): Promise<InquiryType | undefined> {
  const rows = await db.select().from(inquiryTypes).where(eq(inquiryTypes.id, id)).limit(1);
  return rows[0];
}

export async function createInquiryType(
  dto: Pick<InquiryTypeInsert, "name" | "description">
): Promise<InquiryType> {
  const [row] = await db.insert(inquiryTypes).values(dto).returning();
  return row!;
}

export async function updateInquiryType(
  id: string,
  dto: Partial<Pick<InquiryTypeInsert, "name" | "description">>
): Promise<InquiryType | undefined> {
  const [row] = await db
    .update(inquiryTypes)
    .set({ ...dto, updatedAt: new Date() })
    .where(eq(inquiryTypes.id, id))
    .returning();
  return row;
}

export async function deleteInquiryType(id: string): Promise<boolean> {
  const result = await db
    .delete(inquiryTypes)
    .where(eq(inquiryTypes.id, id))
    .returning({ id: inquiryTypes.id });
  return result.length > 0;
}

// Document master
export async function listDocuments(): Promise<DocumentMaster[]> {
  return db.select().from(documentMaster).orderBy(asc(documentMaster.name));
}

export async function getDocumentById(id: string): Promise<DocumentMaster | undefined> {
  const rows = await db.select().from(documentMaster).where(eq(documentMaster.id, id)).limit(1);
  return rows[0];
}

export async function createDocument(
  dto: Pick<DocumentMasterInsert, "name" | "description" | "assignmentTypeId">
): Promise<DocumentMaster> {
  const [row] = await db.insert(documentMaster).values(dto).returning();
  return row!;
}

export async function updateDocument(
  id: string,
  dto: Partial<Pick<DocumentMasterInsert, "name" | "description" | "assignmentTypeId">>
): Promise<DocumentMaster | undefined> {
  const [row] = await db
    .update(documentMaster)
    .set({ ...dto, updatedAt: new Date() })
    .where(eq(documentMaster.id, id))
    .returning();
  return row;
}

export async function deleteDocument(id: string): Promise<boolean> {
  const result = await db
    .delete(documentMaster)
    .where(eq(documentMaster.id, id))
    .returning({ id: documentMaster.id });
  return result.length > 0;
}

// Assignment term templates
export async function listAssignmentTermTemplates(): Promise<AssignmentTermTemplate[]> {
  return db.select().from(assignmentTermTemplates).orderBy(asc(assignmentTermTemplates.name));
}

export async function getAssignmentTermTemplateById(
  id: string
): Promise<AssignmentTermTemplate | undefined> {
  const rows = await db
    .select()
    .from(assignmentTermTemplates)
    .where(eq(assignmentTermTemplates.id, id))
    .limit(1);
  return rows[0];
}

export async function createAssignmentTermTemplate(
  dto: Pick<AssignmentTermTemplateInsert, "name" | "content" | "assignmentTypeId">
): Promise<AssignmentTermTemplate> {
  const [row] = await db.insert(assignmentTermTemplates).values(dto).returning();
  return row!;
}

export async function updateAssignmentTermTemplate(
  id: string,
  dto: Partial<Pick<AssignmentTermTemplateInsert, "name" | "content" | "assignmentTypeId">>
): Promise<AssignmentTermTemplate | undefined> {
  const [row] = await db
    .update(assignmentTermTemplates)
    .set({ ...dto, updatedAt: new Date() })
    .where(eq(assignmentTermTemplates.id, id))
    .returning();
  return row;
}

export async function deleteAssignmentTermTemplate(id: string): Promise<boolean> {
  const result = await db
    .delete(assignmentTermTemplates)
    .where(eq(assignmentTermTemplates.id, id))
    .returning({ id: assignmentTermTemplates.id });
  return result.length > 0;
}

// Payment term templates
export async function listPaymentTermTemplates(): Promise<PaymentTermTemplate[]> {
  return db.select().from(paymentTermTemplates).orderBy(asc(paymentTermTemplates.name));
}

export async function getPaymentTermTemplateById(
  id: string
): Promise<PaymentTermTemplate | undefined> {
  const rows = await db
    .select()
    .from(paymentTermTemplates)
    .where(eq(paymentTermTemplates.id, id))
    .limit(1);
  return rows[0];
}

export async function createPaymentTermTemplate(
  dto: Pick<PaymentTermTemplateInsert, "name" | "content" | "assignmentTypeId">
): Promise<PaymentTermTemplate> {
  const [row] = await db.insert(paymentTermTemplates).values(dto).returning();
  return row!;
}

export async function updatePaymentTermTemplate(
  id: string,
  dto: Partial<Pick<PaymentTermTemplateInsert, "name" | "content" | "assignmentTypeId">>
): Promise<PaymentTermTemplate | undefined> {
  const [row] = await db
    .update(paymentTermTemplates)
    .set({ ...dto, updatedAt: new Date() })
    .where(eq(paymentTermTemplates.id, id))
    .returning();
  return row;
}

export async function deletePaymentTermTemplate(id: string): Promise<boolean> {
  const result = await db
    .delete(paymentTermTemplates)
    .where(eq(paymentTermTemplates.id, id))
    .returning({ id: paymentTermTemplates.id });
  return result.length > 0;
}
