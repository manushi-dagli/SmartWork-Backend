import type { Family, CreateFamilyDto, UpdateFamilyDto } from "../common/types.js";
import * as familyRepo from "../repositories/family.repository.js";
import { NotFoundError } from "../common/errors.js";

export const listFamilies = async (): Promise<Family[]> => familyRepo.findManyFamilies();

export const getFamilyById = async (id: string): Promise<Family> => {
  const fam = await familyRepo.findFamilyById(id);
  if (!fam) throw new NotFoundError("Family not found");
  return fam;
};

export const createFamily = async (dto: CreateFamilyDto): Promise<Family> =>
  familyRepo.createFamily({ name: dto.name.trim() });

export const updateFamily = async (id: string, dto: UpdateFamilyDto): Promise<Family> =>
  familyRepo.updateFamily(id, dto);

export const deleteFamily = async (id: string): Promise<void> => familyRepo.deleteFamily(id);
