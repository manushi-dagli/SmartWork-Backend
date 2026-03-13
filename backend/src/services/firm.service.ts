import type { Firm, CreateFirmDto, UpdateFirmDto } from "../common/types.js";
import * as firmRepo from "../repositories/firm.repository.js";
import { NotFoundError } from "../common/errors.js";

export const listFirms = async (): Promise<Firm[]> => firmRepo.findManyFirms();

export const getFirmById = async (id: string): Promise<Firm> => {
  const firm = await firmRepo.findFirmById(id);
  if (!firm) throw new NotFoundError("Firm not found");
  return firm;
};

export const createFirm = async (dto: CreateFirmDto): Promise<Firm> =>
  firmRepo.createFirm({ ...dto, name: dto.name.trim() });

export const updateFirm = async (id: string, dto: UpdateFirmDto): Promise<Firm> =>
  firmRepo.updateFirm(id, dto);

export const deleteFirm = async (id: string): Promise<void> => firmRepo.deleteFirm(id);
