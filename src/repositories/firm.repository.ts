import { eq, asc } from "drizzle-orm";
import type { Firm, CreateFirmDto, UpdateFirmDto } from "../common/types.js";
import { NotFoundError } from "../common/errors.js";
import { firms } from "../db/schema.js";
import { db } from "../config/database.js";

function mapRow(row: typeof firms.$inferSelect): Firm {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    address: row.address,
    phoneCountryCode: row.phoneCountryCode,
    phoneNumber: row.phoneNumber,
    email: row.email,
    pan: row.pan,
    gst: row.gst,
    bankDetails: row.bankDetails,
    upiId: row.upiId,
    qrCode: row.qrCode,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const findFirmById = async (id: string): Promise<Firm | null> => {
  const rows = await db.select().from(firms).where(eq(firms.id, id)).limit(1);
  const row = rows[0];
  if (!row) return null;
  return mapRow(row);
};

export const findManyFirms = async (): Promise<Firm[]> => {
  const rows = await db.select().from(firms).orderBy(asc(firms.name));
  return rows.map((r) => mapRow(r));
};

export const createFirm = async (dto: CreateFirmDto): Promise<Firm> => {
  const [row] = await db
    .insert(firms)
    .values({
      name: dto.name,
      description: dto.description ?? null,
      address: dto.address ?? null,
      phoneCountryCode: dto.phoneCountryCode ?? null,
      phoneNumber: dto.phoneNumber ?? null,
      email: dto.email ?? null,
      pan: dto.pan ?? null,
      gst: dto.gst ?? null,
      bankDetails: dto.bankDetails ?? null,
      upiId: dto.upiId ?? null,
      qrCode: dto.qrCode ?? null,
    })
    .returning();
  if (!row) throw new Error("Insert failed");
  return mapRow(row);
};

export const updateFirm = async (id: string, dto: UpdateFirmDto): Promise<Firm> => {
  const existing = await findFirmById(id);
  if (!existing) throw new NotFoundError("Firm not found");

  const [row] = await db
    .update(firms)
    .set({
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.address !== undefined && { address: dto.address }),
      ...(dto.phoneCountryCode !== undefined && { phoneCountryCode: dto.phoneCountryCode }),
      ...(dto.phoneNumber !== undefined && { phoneNumber: dto.phoneNumber }),
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.pan !== undefined && { pan: dto.pan }),
      ...(dto.gst !== undefined && { gst: dto.gst }),
      ...(dto.bankDetails !== undefined && { bankDetails: dto.bankDetails }),
      ...(dto.upiId !== undefined && { upiId: dto.upiId }),
      ...(dto.qrCode !== undefined && { qrCode: dto.qrCode }),
      updatedAt: new Date(),
    })
    .where(eq(firms.id, id))
    .returning();
  if (!row) throw new Error("Update failed");
  return mapRow(row);
};

export const deleteFirm = async (id: string): Promise<void> => {
  const result = await db.delete(firms).where(eq(firms.id, id)).returning({ id: firms.id });
  if (result.length === 0) throw new NotFoundError("Firm not found");
};
