import type { Client, CreateClientDto, UpdateClientDto } from "../common/types.js";
import * as clientRepo from "../repositories/client.repository.js";
import { NotFoundError } from "../common/errors.js";

export const listClients = async (): Promise<Client[]> => clientRepo.findManyClients();

export const getClientById = async (id: string): Promise<Client> => {
  const client = await clientRepo.findClientById(id);
  if (!client) throw new NotFoundError("Client not found");
  return client;
};

export const createClient = async (dto: CreateClientDto): Promise<Client> => clientRepo.createClient(dto);

export const updateClient = async (id: string, dto: UpdateClientDto): Promise<Client> =>
  clientRepo.updateClient(id, dto);

export const deleteClient = async (id: string): Promise<void> => clientRepo.deleteClient(id);
