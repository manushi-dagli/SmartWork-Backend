import type { Firm, CreateFirmDto, UpdateFirmDto } from "../common/types.js";
import * as firmRepo from "../repositories/firm.repository.js";
import { NotFoundError } from "../common/errors.js";
import { logger } from "../lib/logger.js";

export const listFirms = async (): Promise<Firm[]> => {
  logger.info("Service: Listing firms");
  return firmRepo.findManyFirms();
};

export const getFirmById = async (id: string): Promise<Firm> => {
  logger.info(`Service: Fetching firm by id ${id}`);
  const firm = await firmRepo.findFirmById(id);
  if (!firm) throw new NotFoundError("Firm not found");
  return firm;
};

export const createFirm = async (dto: CreateFirmDto): Promise<Firm> => {
  logger.info("Service: Creating firm");
  return firmRepo.createFirm({ ...dto, name: dto.name.trim() });
};

export const updateFirm = async (id: string, dto: UpdateFirmDto): Promise<Firm> => {
  logger.info(`Service: Updating firm ${id}`);
  return firmRepo.updateFirm(id, dto);
};

export const deleteFirm = async (id: string): Promise<void> => {
  logger.info(`Service: Deleting firm ${id}`);
  return firmRepo.deleteFirm(id);
};
