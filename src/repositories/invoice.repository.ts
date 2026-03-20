import { eq, desc } from "drizzle-orm";
import { db } from "../config/database.js";
import { invoices } from "../db/schema.js";
import type { InvoiceRow } from "../db/schema.js";
import type { Invoice, CreateInvoiceDto, UpdateInvoiceDto } from "../common/types.js";
import { NotFoundError } from "../common/errors.js";
import { logger } from "../lib/logger.js";

function mapRow(row: InvoiceRow): Invoice {
  return {
    id: row.id,
    clientId: row.clientId,
    assignmentId: row.assignmentId,
    invoiceDate: row.invoiceDate?.toISOString() ?? null,
    amount: row.amount,
    gst: row.gst,
    totalAmount: row.totalAmount,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listInvoices(): Promise<Invoice[]> {
  logger.info(`Repository: Listing invoices`);
  const rows = await db.select().from(invoices).orderBy(desc(invoices.createdAt));
  return rows.map(mapRow);
}

export async function getById(id: string): Promise<Invoice | null> {
  logger.info(`Repository: Fetching invoice by id`);
  const rows = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  const row = rows[0];
  if (!row) return null;
  return mapRow(row);
}

export async function create(dto: CreateInvoiceDto): Promise<Invoice> {
  logger.info(`Repository: Creating invoice`);
  const [row] = await db
    .insert(invoices)
    .values({
      clientId: dto.clientId,
      assignmentId: dto.assignmentId,
      invoiceDate: dto.invoiceDate != null ? new Date(dto.invoiceDate) : null,
      amount: dto.amount ?? null,
      gst: dto.gst ?? null,
      totalAmount: dto.totalAmount ?? null,
      status: dto.status ?? null,
    })
    .returning();
  if (!row) throw new Error("Insert invoice failed");
  return mapRow(row);
}

export async function update(id: string, dto: UpdateInvoiceDto): Promise<Invoice> {
  logger.info(`Repository: Updating invoice`);
  const existing = await getById(id);
  if (!existing) throw new NotFoundError("Invoice not found");
  const [row] = await db
    .update(invoices)
    .set({
      ...(dto.invoiceDate !== undefined && {
        invoiceDate: dto.invoiceDate != null ? new Date(dto.invoiceDate) : null,
      }),
      ...(dto.amount !== undefined && { amount: dto.amount }),
      ...(dto.gst !== undefined && { gst: dto.gst }),
      ...(dto.totalAmount !== undefined && { totalAmount: dto.totalAmount }),
      ...(dto.status !== undefined && { status: dto.status }),
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, id))
    .returning();
  if (!row) throw new Error("Update invoice failed");
  return mapRow(row);
}
