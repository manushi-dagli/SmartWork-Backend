import { eq, asc } from "drizzle-orm";
import type { Client, CreateClientDto, UpdateClientDto } from "../common/types.js";
import { NotFoundError } from "../common/errors.js";
import { clients } from "../db/schema.js";
import { db } from "../config/database.js";

function mapRow(row: typeof clients.$inferSelect): Client {
  return {
    id: row.id,
    firstName: row.firstName,
    middleName: row.middleName,
    lastName: row.lastName,
    address: row.address,
    phone1CountryCode: row.phone1CountryCode,
    phone1Number: row.phone1Number,
    phone2CountryCode: row.phone2CountryCode,
    phone2Number: row.phone2Number,
    email1: row.email1,
    email2: row.email2,
    pan: row.pan,
    gst: row.gst,
    bankDetails: row.bankDetails,
    dsc: row.dsc,
    otp: row.otp,
    familyId: row.familyId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const findClientById = async (id: string): Promise<Client | null> => {
  const rows = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  const row = rows[0];
  if (!row) return null;
  return mapRow(row);
};

export const findManyClients = async (): Promise<Client[]> => {
  const rows = await db.select().from(clients).orderBy(asc(clients.firstName), asc(clients.lastName));
  return rows.map((r) => mapRow(r));
};

export const createClient = async (dto: CreateClientDto): Promise<Client> => {
  const [row] = await db
    .insert(clients)
    .values({
      firstName: dto.firstName,
      middleName: dto.middleName ?? null,
      lastName: dto.lastName,
      address: dto.address ?? null,
      phone1CountryCode: dto.phone1CountryCode ?? null,
      phone1Number: dto.phone1Number ?? null,
      phone2CountryCode: dto.phone2CountryCode ?? null,
      phone2Number: dto.phone2Number ?? null,
      email1: dto.email1 ?? null,
      email2: dto.email2 ?? null,
      pan: dto.pan ?? null,
      gst: dto.gst ?? null,
      bankDetails: dto.bankDetails ?? null,
      dsc: dto.dsc ?? null,
      otp: dto.otp ?? null,
      familyId: dto.familyId ?? null,
    })
    .returning();
  if (!row) throw new Error("Insert failed");
  return mapRow(row);
};

export const updateClient = async (id: string, dto: UpdateClientDto): Promise<Client> => {
  const existing = await findClientById(id);
  if (!existing) throw new NotFoundError("Client not found");

  const [row] = await db
    .update(clients)
    .set({
      ...(dto.firstName !== undefined && { firstName: dto.firstName }),
      ...(dto.middleName !== undefined && { middleName: dto.middleName }),
      ...(dto.lastName !== undefined && { lastName: dto.lastName }),
      ...(dto.address !== undefined && { address: dto.address }),
      ...(dto.phone1CountryCode !== undefined && { phone1CountryCode: dto.phone1CountryCode }),
      ...(dto.phone1Number !== undefined && { phone1Number: dto.phone1Number }),
      ...(dto.phone2CountryCode !== undefined && { phone2CountryCode: dto.phone2CountryCode }),
      ...(dto.phone2Number !== undefined && { phone2Number: dto.phone2Number }),
      ...(dto.email1 !== undefined && { email1: dto.email1 }),
      ...(dto.email2 !== undefined && { email2: dto.email2 }),
      ...(dto.pan !== undefined && { pan: dto.pan }),
      ...(dto.gst !== undefined && { gst: dto.gst }),
      ...(dto.bankDetails !== undefined && { bankDetails: dto.bankDetails }),
      ...(dto.dsc !== undefined && { dsc: dto.dsc }),
      ...(dto.otp !== undefined && { otp: dto.otp }),
      ...(dto.familyId !== undefined && { familyId: dto.familyId }),
      updatedAt: new Date(),
    })
    .where(eq(clients.id, id))
    .returning();
  if (!row) throw new Error("Update failed");
  return mapRow(row);
};

export const deleteClient = async (id: string): Promise<void> => {
  const result = await db.delete(clients).where(eq(clients.id, id)).returning({ id: clients.id });
  if (result.length === 0) throw new NotFoundError("Client not found");
};
