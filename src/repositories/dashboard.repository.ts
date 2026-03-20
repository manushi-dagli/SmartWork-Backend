import { eq, count, isNull } from "drizzle-orm";
import { db } from "../config/database.js";
import {
  taskRequests,
  assignments,
  queries,
  invoices,
  allocatedTasks,
} from "../db/schema.js";
import { logger } from "../lib/logger.js";

export interface DashboardStats {
  pendingTaskRequests: number;
  assignmentsInProgress: number;
  assignmentsCompleted: number;
  openQueries: number;
  unpaidInvoices: number;
  allocatedTasksWithoutReview: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  logger.info(`Repository: Fetching dashboard stats`);
  const [pendingTr] = await db
    .select({ value: count(taskRequests.id) })
    .from(taskRequests)
    .where(eq(taskRequests.status, "PENDING"));
  const [inProgress] = await db
    .select({ value: count(assignments.id) })
    .from(assignments)
    .where(eq(assignments.status, "IN_PROGRESS"));
  const [completed] = await db
    .select({ value: count(assignments.id) })
    .from(assignments)
    .where(eq(assignments.status, "COMPLETED"));
  const [openQ] = await db
    .select({ value: count(queries.id) })
    .from(queries)
    .where(eq(queries.status, "OPEN"));
  const [unpaid] = await db
    .select({ value: count(invoices.id) })
    .from(invoices)
    .where(eq(invoices.status, "UNPAID"));
  const [noReview] = await db
    .select({ value: count(allocatedTasks.id) })
    .from(allocatedTasks)
    .where(isNull(allocatedTasks.reviewStatus));

  return {
    pendingTaskRequests: pendingTr?.value ?? 0,
    assignmentsInProgress: inProgress?.value ?? 0,
    assignmentsCompleted: completed?.value ?? 0,
    openQueries: openQ?.value ?? 0,
    unpaidInvoices: unpaid?.value ?? 0,
    allocatedTasksWithoutReview: noReview?.value ?? 0,
  };
}
