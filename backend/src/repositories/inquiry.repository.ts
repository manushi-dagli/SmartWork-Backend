import { eq, asc, desc, inArray } from "drizzle-orm";
import { db } from "../config/database.js";
import {
  inquiries,
  inquiryDocuments,
  documentMaster,
} from "../db/schema.js";
import type { InquiryRow } from "../db/schema.js";
import type { CreateClientDto } from "../common/types.js";
import { NotFoundError } from "../common/errors.js";
import * as clientRepo from "./client.repository.js";

export type InquiryStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface InquiryWithDocuments extends InquiryRow {
  documentIds: string[];
}

export interface DocumentForInquiry {
  id: string;
  name: string;
  description: string | null;
}

/** List inquiries with optional status filter; newest first. */
export async function listInquiries(filters?: {
  status?: InquiryStatus;
}): Promise<InquiryRow[]> {
  if (filters?.status) {
    return db
      .select()
      .from(inquiries)
      .where(eq(inquiries.status, filters.status))
      .orderBy(desc(inquiries.createdAt));
  }
  return db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
}

/** Get single inquiry by id. */
export async function getInquiryById(id: string): Promise<InquiryRow | undefined> {
  const rows = await db.select().from(inquiries).where(eq(inquiries.id, id)).limit(1);
  return rows[0];
}

/** Get inquiry with linked document IDs. */
export async function getInquiryWithDocuments(
  id: string
): Promise<InquiryWithDocuments | undefined> {
  const inquiry = await getInquiryById(id);
  if (!inquiry) return undefined;
  const links = await db
    .select({ documentMasterId: inquiryDocuments.documentMasterId })
    .from(inquiryDocuments)
    .where(eq(inquiryDocuments.inquiryId, id));
  return {
    ...inquiry,
    documentIds: links.map((l) => l.documentMasterId),
  };
}

export interface CreateInquiryDto {
  assignmentTypeId: string;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhoneCountryCode?: string | null;
  contactPhoneNumber?: string | null;
  contactPhone2CountryCode?: string | null;
  contactPhone2Number?: string | null;
}

export async function createInquiry(dto: CreateInquiryDto): Promise<InquiryRow> {
  const [row] = await db
    .insert(inquiries)
    .values({
      assignmentTypeId: dto.assignmentTypeId,
      contactName: dto.contactName ?? null,
      contactEmail: dto.contactEmail ?? null,
      contactPhoneCountryCode: dto.contactPhoneCountryCode ?? null,
      contactPhoneNumber: dto.contactPhoneNumber ?? null,
      contactPhone2CountryCode: dto.contactPhone2CountryCode ?? null,
      contactPhone2Number: dto.contactPhone2Number ?? null,
    })
    .returning();
  if (!row) throw new Error("Insert inquiry failed");
  return row;
}

export interface UpdateInquiryDto {
  assignmentTypeId?: string;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhoneCountryCode?: string | null;
  contactPhoneNumber?: string | null;
  contactPhone2CountryCode?: string | null;
  contactPhone2Number?: string | null;
  assignmentTermsSnapshot?: unknown;
  paymentTermsSnapshot?: unknown;
  assignmentTermTemplateId?: string | null;
  paymentTermTemplateId?: string | null;
  emailedAt?: Date | null;
  whatsappSentAt?: Date | null;
}

export async function updateInquiry(
  id: string,
  dto: UpdateInquiryDto
): Promise<InquiryRow | undefined> {
  const set: Record<string, unknown> = { ...dto, updatedAt: new Date() };
  const [row] = await db
    .update(inquiries)
    .set(set)
    .where(eq(inquiries.id, id))
    .returning();
  return row;
}

/** Replace all document links for an inquiry. */
export async function setInquiryDocuments(
  inquiryId: string,
  documentMasterIds: string[]
): Promise<void> {
  await db.delete(inquiryDocuments).where(eq(inquiryDocuments.inquiryId, inquiryId));
  if (documentMasterIds.length === 0) return;
  await db.insert(inquiryDocuments).values(
    documentMasterIds.map((documentMasterId) => ({
      inquiryId,
      documentMasterId,
    }))
  );
}

/** Get document master rows linked to this inquiry. */
export async function getDocumentsForInquiry(
  inquiryId: string
): Promise<DocumentForInquiry[]> {
  const links = await db
    .select({ documentMasterId: inquiryDocuments.documentMasterId })
    .from(inquiryDocuments)
    .where(eq(inquiryDocuments.inquiryId, inquiryId));
  if (links.length === 0) return [];
  const ids = links.map((l) => l.documentMasterId);
  return db
    .select({
      id: documentMaster.id,
      name: documentMaster.name,
      description: documentMaster.description,
    })
    .from(documentMaster)
    .where(inArray(documentMaster.id, ids));
}

/** Get documents that are linked to this inquiry type (for checklist). */
export async function getDocumentsByInquiryType(
  inquiryTypeId: string
): Promise<DocumentForInquiry[]> {
  const rows = await db
    .select({
      id: documentMaster.id,
      name: documentMaster.name,
      description: documentMaster.description,
    })
    .from(documentMaster)
    .where(eq(documentMaster.assignmentTypeId, inquiryTypeId))
    .orderBy(asc(documentMaster.name));
  return rows;
}

/** Map inquiry contact fields to CreateClientDto (firstName/lastName from contactName). */
function inquiryContactToClientDto(inquiry: InquiryRow): CreateClientDto {
  const name = (inquiry.contactName ?? "").trim();
  const firstSpace = name.indexOf(" ");
  let firstName: string;
  let lastName: string;
  if (firstSpace > 0) {
    firstName = name.slice(0, firstSpace);
    lastName = name.slice(firstSpace + 1).trim() || "—";
  } else {
    firstName = name || "—";
    lastName = "—";
  }
  return {
    firstName,
    lastName,
    email1: inquiry.contactEmail ?? null,
    phone1CountryCode: inquiry.contactPhoneCountryCode ?? null,
    phone1Number: inquiry.contactPhoneNumber ?? null,
  };
}

/** Accept inquiry: create client from contact, link inquiry to client, set status ACCEPTED. */
export async function acceptInquiry(inquiryId: string): Promise<InquiryRow> {
  const inquiry = await getInquiryById(inquiryId);
  if (!inquiry) throw new NotFoundError("Inquiry not found");
  if (inquiry.status !== "PENDING") {
    throw new Error("Inquiry can only be accepted when status is PENDING");
  }
  if (inquiry.clientId) {
    throw new Error("Inquiry already linked to a client");
  }
  const clientDto = inquiryContactToClientDto(inquiry);
  const client = await clientRepo.createClient(clientDto);
  const [updated] = await db
    .update(inquiries)
    .set({
      clientId: client.id,
      status: "ACCEPTED",
      updatedAt: new Date(),
    })
    .where(eq(inquiries.id, inquiryId))
    .returning();
  if (!updated) throw new Error("Update inquiry failed");
  return updated;
}

/** Reject inquiry: set status to REJECTED (only when PENDING). */
export async function rejectInquiry(inquiryId: string): Promise<InquiryRow> {
  const inquiry = await getInquiryById(inquiryId);
  if (!inquiry) throw new NotFoundError("Inquiry not found");
  if (inquiry.status !== "PENDING") {
    throw new Error("Inquiry can only be rejected when status is PENDING");
  }
  const [updated] = await db
    .update(inquiries)
    .set({ status: "REJECTED", updatedAt: new Date() })
    .where(eq(inquiries.id, inquiryId))
    .returning();
  if (!updated) throw new Error("Update inquiry failed");
  return updated;
}
