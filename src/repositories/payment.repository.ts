import { eq, desc } from "drizzle-orm";
import { db } from "../config/database.js";
import { payments } from "../db/schema.js";
import type { PaymentRow } from "../db/schema.js";
import type { Payment, CreatePaymentDto, UpdatePaymentDto } from "../common/types.js";
import { NotFoundError } from "../common/errors.js";
import { logger } from "../lib/logger.js";

function mapRow(row: PaymentRow): Payment {
  return {
    id: row.id,
    invoiceId: row.invoiceId,
    paymentDate: row.paymentDate?.toISOString() ?? null,
    amountReceived: row.amountReceived,
    mode: row.mode,
    bankName: row.bankName,
    remarks: row.remarks,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listByInvoice(invoiceId: string): Promise<Payment[]> {
  logger.info(`Repository: Listing payments by invoice id`);
  const rows = await db
    .select()
    .from(payments)
    .where(eq(payments.invoiceId, invoiceId))
    .orderBy(desc(payments.createdAt));
  return rows.map(mapRow);
}

export async function getById(id: string): Promise<Payment | null> {
  logger.info(`Repository: Fetching payment by id`);
  const rows = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
  const row = rows[0];
  if (!row) return null;
  return mapRow(row);
}

export async function create(dto: CreatePaymentDto): Promise<Payment> {
  logger.info(`Repository: Creating payment`);
  const [row] = await db
    .insert(payments)
    .values({
      invoiceId: dto.invoiceId,
      paymentDate: dto.paymentDate != null ? new Date(dto.paymentDate) : null,
      amountReceived: dto.amountReceived ?? null,
      mode: dto.mode ?? null,
      bankName: dto.bankName ?? null,
      remarks: dto.remarks ?? null,
    })
    .returning();
  if (!row) throw new Error("Insert payment failed");
  return mapRow(row);
}

export async function update(id: string, dto: UpdatePaymentDto): Promise<Payment> {
  logger.info(`Repository: Updating payment`);
  const existing = await getById(id);
  if (!existing) throw new NotFoundError("Payment not found");
  const [row] = await db
    .update(payments)
    .set({
      ...(dto.paymentDate !== undefined && {
        paymentDate: dto.paymentDate != null ? new Date(dto.paymentDate) : null,
      }),
      ...(dto.amountReceived !== undefined && { amountReceived: dto.amountReceived }),
      ...(dto.mode !== undefined && { mode: dto.mode }),
      ...(dto.bankName !== undefined && { bankName: dto.bankName }),
      ...(dto.remarks !== undefined && { remarks: dto.remarks }),
      updatedAt: new Date(),
    })
    .where(eq(payments.id, id))
    .returning();
  if (!row) throw new Error("Update payment failed");
  return mapRow(row);
}
