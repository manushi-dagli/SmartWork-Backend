import { eq, desc, and } from "drizzle-orm";
import { db } from "../config/database.js";
import { assignments, clients, tasks, employees } from "../db/schema.js";
import type { AssignmentRow } from "../db/schema.js";
import type {
  Assignment,
  CreateAssignmentDto,
  UpdateAssignmentDto,
} from "../common/types.js";
import { NotFoundError } from "../common/errors.js";
import { logger } from "../lib/logger.js";

export type AssignmentStatus = "IN_PROGRESS" | "COMPLETED";

function mapRow(row: AssignmentRow): Assignment {
  return {
    id: row.id,
    clientId: row.clientId,
    taskId: row.taskId,
    financialYear: row.financialYear,
    startDate: row.startDate?.toISOString() ?? null,
    dueDate: row.dueDate?.toISOString() ?? null,
    managerId: row.managerId,
    estimatedFees: row.estimatedFees,
    taskRequestId: row.taskRequestId,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export interface AssignmentListFilters {
  clientId?: string;
  status?: AssignmentStatus;
}

/** List assignments with optional filters; newest first. */
export async function listAssignments(
  filters?: AssignmentListFilters
): Promise<Assignment[]> {
  logger.info(`Repository: Listing assignments`);
  const conditions = [];
  if (filters?.clientId) {
    conditions.push(eq(assignments.clientId, filters.clientId));
  }
  if (filters?.status) {
    conditions.push(eq(assignments.status, filters.status));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const rows = await db
    .select()
    .from(assignments)
    .where(where)
    .orderBy(desc(assignments.createdAt));
  return rows.map(mapRow);
}

/** Get single assignment by id. */
export async function getAssignmentById(id: string): Promise<Assignment | null> {
  logger.info(`Repository: Fetching assignment by id`);
  const rows = await db
    .select()
    .from(assignments)
    .where(eq(assignments.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  return mapRow(row);
}

/** Get assignment with client, task, and manager details for display. */
export async function getAssignmentWithDetails(id: string): Promise<{
  assignment: Assignment;
  client: { id: string; firstName: string; lastName: string } | null;
  task: { id: string; name: string } | null;
  manager: { id: string; firstName: string; lastName: string } | null;
} | null> {
  logger.info(`Repository: Fetching assignment with details by id`);
  const row = await db
    .select()
    .from(assignments)
    .where(eq(assignments.id, id))
    .limit(1)
    .then((r) => r[0]);
  if (!row) return null;

  const [clientRow] = await db
    .select({ id: clients.id, firstName: clients.firstName, lastName: clients.lastName })
    .from(clients)
    .where(eq(clients.id, row.clientId))
    .limit(1);
  const [taskRow] = await db
    .select({ id: tasks.id, name: tasks.name })
    .from(tasks)
    .where(eq(tasks.id, row.taskId))
    .limit(1);
  let managerRow: { id: string; firstName: string; lastName: string } | undefined;
  if (row.managerId) {
    [managerRow] = await db
      .select({ id: employees.id, firstName: employees.firstName, lastName: employees.lastName })
      .from(employees)
      .where(eq(employees.id, row.managerId))
      .limit(1);
  }

  return {
    assignment: mapRow(row),
    client: clientRow ?? null,
    task: taskRow ?? null,
    manager: managerRow ?? null,
  };
}

export async function createAssignment(
  dto: CreateAssignmentDto
): Promise<Assignment> {
  logger.info(`Repository: Creating assignment`);
  const [row] = await db
    .insert(assignments)
    .values({
      clientId: dto.clientId,
      taskId: dto.taskId,
      financialYear: dto.financialYear ?? null,
      startDate: dto.startDate != null ? new Date(dto.startDate) : null,
      dueDate: dto.dueDate != null ? new Date(dto.dueDate) : null,
      managerId: dto.managerId ?? null,
      estimatedFees: dto.estimatedFees ?? null,
      taskRequestId: dto.taskRequestId ?? null,
    })
    .returning();
  if (!row) throw new Error("Insert assignment failed");
  return mapRow(row);
}

export async function updateAssignment(
  id: string,
  dto: UpdateAssignmentDto
): Promise<Assignment> {
  logger.info(`Repository: Updating assignment`);
  const existing = await getAssignmentById(id);
  if (!existing) throw new NotFoundError("Assignment not found");

  const [row] = await db
    .update(assignments)
    .set({
      ...(dto.clientId !== undefined && { clientId: dto.clientId }),
      ...(dto.taskId !== undefined && { taskId: dto.taskId }),
      ...(dto.financialYear !== undefined && { financialYear: dto.financialYear }),
      ...(dto.startDate !== undefined && {
        startDate: dto.startDate != null ? new Date(dto.startDate) : null,
      }),
      ...(dto.dueDate !== undefined && {
        dueDate: dto.dueDate != null ? new Date(dto.dueDate) : null,
      }),
      ...(dto.managerId !== undefined && { managerId: dto.managerId }),
      ...(dto.estimatedFees !== undefined && { estimatedFees: dto.estimatedFees }),
      ...(dto.taskRequestId !== undefined && { taskRequestId: dto.taskRequestId }),
      ...(dto.status !== undefined && { status: dto.status }),
      updatedAt: new Date(),
    })
    .where(eq(assignments.id, id))
    .returning();
  if (!row) throw new Error("Update assignment failed");
  return mapRow(row);
}

export async function deleteAssignment(id: string): Promise<void> {
  logger.info(`Repository: Deleting assignment`);
  const deleted = await db
    .delete(assignments)
    .where(eq(assignments.id, id))
    .returning({ id: assignments.id });
  if (deleted.length === 0) throw new NotFoundError("Assignment not found");
}
