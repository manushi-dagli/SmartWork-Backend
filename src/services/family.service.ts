import type { Family, CreateFamilyDto, UpdateFamilyDto } from "../common/types.js";
import * as familyRepo from "../repositories/family.repository.js";
import { NotFoundError } from "../common/errors.js";
import { logger } from "../lib/logger.js";

export const listFamilies = async (): Promise<Family[]> => {
  logger.info("Service: Listing families");
  return familyRepo.findManyFamilies();
};

export const getFamilyById = async (id: string): Promise<Family> => {
  logger.info(`Service: Fetching family by id ${id}`);
  const fam = await familyRepo.findFamilyById(id);
  if (!fam) throw new NotFoundError("Family not found");
  return fam;
};

export const createFamily = async (dto: CreateFamilyDto): Promise<Family> => {
  logger.info("Service: Creating family");
  return familyRepo.createFamily({ name: dto.name.trim() });
};

export const updateFamily = async (id: string, dto: UpdateFamilyDto): Promise<Family> => {
  logger.info(`Service: Updating family ${id}`);
  return familyRepo.updateFamily(id, dto);
};

export const deleteFamily = async (id: string): Promise<void> => {
  logger.info(`Service: Deleting family ${id}`);
  return familyRepo.deleteFamily(id);
};
