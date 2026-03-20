import { eq, asc, desc, inArray } from "drizzle-orm";
import { db } from "../config/database.js";
import {
  taskRequests,
  taskRequestDocuments,
  taskRequestAttachments,
  documentMaster,
} from "../db/schema.js";
import type { TaskRequestRow } from "../db/schema.js";
import type { CreateClientDto } from "../common/types.js";
import { NotFoundError } from "../common/errors.js";
import * as clientRepo from "./client.repository.js";
import { logger } from "../lib/logger.js";

export type TaskRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface TaskRequestAttachmentMeta {
  id: string;
  fileName: string;
  mimeType: string;
  createdAt: Date;
}

export interface TaskRequestWithDocuments extends TaskRequestRow {
  documentIds: string[];
  attachments: TaskRequestAttachmentMeta[];
}

export interface DocumentForTaskRequest {
  id: string;
  name: string;
  description: string | null;
}

/** List task requests with optional status filter; newest first. */
export async function listTaskRequests(filters?: {
  status?: TaskRequestStatus;
}): Promise<TaskRequestRow[]> {
  logger.info(`Repository: Listing task requests`);
  if (filters?.status) {
    return db
      .select()
      .from(taskRequests)
      .where(eq(taskRequests.status, filters.status))
      .orderBy(desc(taskRequests.createdAt));
  }
  return db.select().from(taskRequests).orderBy(desc(taskRequests.createdAt));
}

/** Get single task request by id. */
export async function getTaskRequestById(id: string): Promise<TaskRequestRow | undefined> {
  logger.info(`Repository: Fetching task request by id`);
  const rows = await db.select().from(taskRequests).where(eq(taskRequests.id, id)).limit(1);
  return rows[0];
}

/** Get task request with linked document IDs and attachment metadata. */
export async function getTaskRequestWithDocuments(
  id: string
): Promise<TaskRequestWithDocuments | undefined> {
  logger.info(`Repository: Fetching task request with documents by id`);
  const tr = await getTaskRequestById(id);
  if (!tr) return undefined;
  const links = await db
    .select({ documentMasterId: taskRequestDocuments.documentMasterId })
    .from(taskRequestDocuments)
    .where(eq(taskRequestDocuments.taskRequestId, id));
  const attachmentRows = await db
    .select({
      id: taskRequestAttachments.id,
      fileName: taskRequestAttachments.fileName,
      mimeType: taskRequestAttachments.mimeType,
      createdAt: taskRequestAttachments.createdAt,
    })
    .from(taskRequestAttachments)
    .where(eq(taskRequestAttachments.taskRequestId, id))
    .orderBy(asc(taskRequestAttachments.createdAt));
  return {
    ...tr,
    documentIds: links.map((l) => l.documentMasterId),
    attachments: attachmentRows.map((a) => ({
      id: a.id,
      fileName: a.fileName,
      mimeType: a.mimeType,
      createdAt: a.createdAt,
    })),
  };
}

export interface CreateTaskRequestDto {
  firmId?: string | null;
  taskId: string;
  subtaskId?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhoneCountryCode?: string | null;
  contactPhoneNumber?: string | null;
  contactPhone2CountryCode?: string | null;
  contactPhone2Number?: string | null;
  assignmentTerms?: string | null;
  paymentTerms?: string | null;
  paymentCost?: string | null;
}

export async function createTaskRequest(dto: CreateTaskRequestDto): Promise<TaskRequestRow> {
  logger.info(`Repository: Creating task request`);
  const [row] = await db
    .insert(taskRequests)
    .values({
      firmId: dto.firmId ?? null,
      taskId: dto.taskId,
      subtaskId: dto.subtaskId ?? null,
      contactName: dto.contactName ?? null,
      contactEmail: dto.contactEmail ?? null,
      contactPhoneCountryCode: dto.contactPhoneCountryCode ?? null,
      contactPhoneNumber: dto.contactPhoneNumber ?? null,
      contactPhone2CountryCode: dto.contactPhone2CountryCode ?? null,
      contactPhone2Number: dto.contactPhone2Number ?? null,
      assignmentTerms: dto.assignmentTerms ?? null,
      paymentTerms: dto.paymentTerms ?? null,
      paymentCost: dto.paymentCost ?? null,
    })
    .returning();
  if (!row) throw new Error("Insert task request failed");
  return row;
}

export interface UpdateTaskRequestDto {
  firmId?: string | null;
  taskId?: string;
  subtaskId?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhoneCountryCode?: string | null;
  contactPhoneNumber?: string | null;
  contactPhone2CountryCode?: string | null;
  contactPhone2Number?: string | null;
  assignmentTerms?: string | null;
  paymentTerms?: string | null;
  paymentCost?: string | null;
  emailedAt?: Date | null;
  whatsappSentAt?: Date | null;
}

export async function updateTaskRequest(
  id: string,
  dto: UpdateTaskRequestDto
): Promise<TaskRequestRow | undefined> {
  logger.info(`Repository: Updating task request`);
  const set: Record<string, unknown> = { ...dto, updatedAt: new Date() };
  const [row] = await db
    .update(taskRequests)
    .set(set)
    .where(eq(taskRequests.id, id))
    .returning();
  return row;
}

/** Replace all document links for a task request. */
export async function setTaskRequestDocuments(
  taskRequestId: string,
  documentMasterIds: string[]
): Promise<void> {
  logger.info(`Repository: Setting task request documents`);
  await db.delete(taskRequestDocuments).where(eq(taskRequestDocuments.taskRequestId, taskRequestId));
  if (documentMasterIds.length === 0) return;
  await db.insert(taskRequestDocuments).values(
    documentMasterIds.map((documentMasterId) => ({
      taskRequestId,
      documentMasterId,
    }))
  );
}

/** Get document master rows linked to this task request. */
export async function getDocumentsForTaskRequest(
  taskRequestId: string
): Promise<DocumentForTaskRequest[]> {
  logger.info(`Repository: Listing documents for task request`);
  const links = await db
    .select({ documentMasterId: taskRequestDocuments.documentMasterId })
    .from(taskRequestDocuments)
    .where(eq(taskRequestDocuments.taskRequestId, taskRequestId));
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

/** Map task request contact and terms fields to CreateClientDto. */
function taskRequestContactToClientDto(tr: TaskRequestRow): CreateClientDto {
  const name = (tr.contactName ?? "").trim();
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
    email1: tr.contactEmail ?? null,
    phone1CountryCode: tr.contactPhoneCountryCode ?? null,
    phone1Number: tr.contactPhoneNumber ?? null,
    taskId: tr.taskId ?? null,
    subtaskId: tr.subtaskId ?? null,
    assignmentTerms: tr.assignmentTerms ?? null,
    paymentTerms: tr.paymentTerms ?? null,
    paymentCost: tr.paymentCost ?? null,
  };
}

/** Accept task request: create client from contact, link to client, set status ACCEPTED. */
export async function acceptTaskRequest(taskRequestId: string): Promise<TaskRequestRow> {
  logger.info(`Repository: Accepting task request`);
  const tr = await getTaskRequestById(taskRequestId);
  if (!tr) throw new NotFoundError("Task request not found");
  if (tr.status !== "PENDING") {
    throw new Error("Task request can only be accepted when status is PENDING");
  }
  if (tr.clientId) {
    throw new Error("Task request already linked to a client");
  }
  const clientDto = taskRequestContactToClientDto(tr);
  const client = await clientRepo.createClient(clientDto);
  const [updated] = await db
    .update(taskRequests)
    .set({
      clientId: client.id,
      status: "ACCEPTED",
      updatedAt: new Date(),
    })
    .where(eq(taskRequests.id, taskRequestId))
    .returning();
  if (!updated) throw new Error("Update task request failed");
  return updated;
}

/** Reject task request: set status to REJECTED (only when PENDING). */
export async function rejectTaskRequest(taskRequestId: string): Promise<TaskRequestRow> {
  logger.info(`Repository: Rejecting task request`);
  const tr = await getTaskRequestById(taskRequestId);
  if (!tr) throw new NotFoundError("Task request not found");
  if (tr.status !== "PENDING") {
    throw new Error("Task request can only be rejected when status is PENDING");
  }
  const [updated] = await db
    .update(taskRequests)
    .set({ status: "REJECTED", updatedAt: new Date() })
    .where(eq(taskRequests.id, taskRequestId))
    .returning();
  if (!updated) throw new Error("Update task request failed");
  return updated;
}
