import type { Client, CreateClientDto, UpdateClientDto } from "../common/types.js";
import * as clientRepo from "../repositories/client.repository.js";
import { NotFoundError } from "../common/errors.js";
import { logger } from "../lib/logger.js";

export const listClients = async (): Promise<Client[]> => {
  logger.info("Service: Listing clients");
  return clientRepo.findManyClients();
};

export const getClientById = async (id: string): Promise<Client> => {
  logger.info(`Service: Fetching client by id ${id}`);
  const client = await clientRepo.findClientById(id);
  if (!client) throw new NotFoundError("Client not found");
  return client;
};

export const createClient = async (dto: CreateClientDto): Promise<Client> => {
  logger.info("Service: Creating client");
  return clientRepo.createClient(dto);
};

export const updateClient = async (id: string, dto: UpdateClientDto): Promise<Client> => {
  logger.info(`Service: Updating client ${id}`);
  return clientRepo.updateClient(id, dto);
};

export const deleteClient = async (id: string): Promise<void> => {
  logger.info(`Service: Deleting client ${id}`);
  return clientRepo.deleteClient(id);
};
