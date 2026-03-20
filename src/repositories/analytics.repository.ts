import { eq } from "drizzle-orm";
import { db } from "../config/database.js";
import {
  clients,
  firms,
  assignments,
  tasks,
  invoices,
  payments,
} from "../db/schema.js";
import { logger } from "../lib/logger.js";

function parseAmount(t: string | null | undefined): number {
  if (t == null || t === "") return 0;
  const n = parseFloat(String(t).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export interface AssignmentAnalyticsRow {
  assignmentId: string;
  taskId: string;
  taskName: string;
  financialYear: string | null;
  status: string | null;
  estimatedFees: string | null;
  estimatedFeesNumeric: number;
  charged: number;
  revenue: number;
}

export interface ClientAnalyticsRow {
  clientId: string;
  clientName: string;
  firmId: string | null;
  firmName: string | null;
  assignmentCount: number;
  assignments: AssignmentAnalyticsRow[];
  totalEstimatedFees: number;
  totalCharged: number;
  totalRevenue: number;
}

export interface FirmAnalyticsRow {
  firmId: string;
  firmName: string;
  clientCount: number;
  totalCharged: number;
  totalRevenue: number;
  clients: ClientAnalyticsRow[];
}

export interface AnalyticsSummary {
  byClient: ClientAnalyticsRow[];
  byFirm: FirmAnalyticsRow[];
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  logger.info(`Repository: Fetching analytics summary`);
  const [clientRows, assignmentRows, invoiceRows, paymentRows, firmRows] =
    await Promise.all([
      db.select().from(clients),
      db
        .select({
          id: assignments.id,
          clientId: assignments.clientId,
          taskId: assignments.taskId,
          taskName: tasks.name,
          financialYear: assignments.financialYear,
          status: assignments.status,
          estimatedFees: assignments.estimatedFees,
        })
        .from(assignments)
        .leftJoin(tasks, eq(assignments.taskId, tasks.id)),
      db.select({ id: invoices.id, assignmentId: invoices.assignmentId, clientId: invoices.clientId, totalAmount: invoices.totalAmount }).from(invoices),
      db.select({ invoiceId: payments.invoiceId, amountReceived: payments.amountReceived }).from(payments),
      db.select({ id: firms.id, name: firms.name }).from(firms),
    ]);

  const firmById = new Map(firmRows.map((f) => [f.id, f.name]));

  const invoiceByAssignment = new Map<string | null, { id: string; clientId: string; totalAmount: string | null }>();
  for (const inv of invoiceRows) {
    invoiceByAssignment.set(inv.assignmentId, {
      id: inv.id,
      clientId: inv.clientId,
      totalAmount: inv.totalAmount,
    });
  }

  const paymentsByInvoice = new Map<string, number>();
  for (const p of paymentRows) {
    const prev = paymentsByInvoice.get(p.invoiceId) ?? 0;
    paymentsByInvoice.set(p.invoiceId, prev + parseAmount(p.amountReceived));
  }

  const byClientMap = new Map<string, ClientAnalyticsRow>();

  for (const c of clientRows) {
    const clientName = [c.firstName, c.middleName, c.lastName].filter(Boolean).join(" ");
    const firmName = c.firmId ? firmById.get(c.firmId) ?? null : null;
    byClientMap.set(c.id, {
      clientId: c.id,
      clientName,
      firmId: c.firmId,
      firmName: firmName ?? null,
      assignmentCount: 0,
      assignments: [],
      totalEstimatedFees: 0,
      totalCharged: 0,
      totalRevenue: 0,
    });
  }

  for (const a of assignmentRows) {
    const clientRow = byClientMap.get(a.clientId);
    if (!clientRow) continue;

    const inv = invoiceByAssignment.get(a.id) ?? null;
    const charged = inv ? parseAmount(inv.totalAmount) : 0;
    const invId = inv?.id;
    const revenue = invId ? (paymentsByInvoice.get(invId) ?? 0) : 0;
    const estimatedFeesNumeric = parseAmount(a.estimatedFees);

    const row: AssignmentAnalyticsRow = {
      assignmentId: a.id,
      taskId: a.taskId,
      taskName: a.taskName ?? "—",
      financialYear: a.financialYear ?? null,
      status: a.status ?? null,
      estimatedFees: a.estimatedFees ?? null,
      estimatedFeesNumeric,
      charged,
      revenue,
    };

    clientRow.assignments.push(row);
    clientRow.assignmentCount = clientRow.assignments.length;
    clientRow.totalEstimatedFees += estimatedFeesNumeric;
    clientRow.totalCharged += charged;
    clientRow.totalRevenue += revenue;
  }

  const byClient = Array.from(byClientMap.values()).sort((x, y) =>
    x.clientName.localeCompare(y.clientName)
  );

  const byFirmMap = new Map<string, FirmAnalyticsRow>();

  for (const f of firmRows) {
    byFirmMap.set(f.id, {
      firmId: f.id,
      firmName: f.name,
      clientCount: 0,
      totalCharged: 0,
      totalRevenue: 0,
      clients: [],
    });
  }

  const noFirmId = "__no_firm__";
  if (!byFirmMap.has(noFirmId)) {
    byFirmMap.set(noFirmId, {
      firmId: noFirmId,
      firmName: "— No firm —",
      clientCount: 0,
      totalCharged: 0,
      totalRevenue: 0,
      clients: [],
    });
  }

  for (const client of byClient) {
    const firmKey = client.firmId ?? noFirmId;
    let firmRow = byFirmMap.get(firmKey);
    if (!firmRow && firmKey !== noFirmId) {
      firmRow = {
        firmId: firmKey,
        firmName: client.firmName ?? "—",
        clientCount: 0,
        totalCharged: 0,
        totalRevenue: 0,
        clients: [],
      };
      byFirmMap.set(firmKey, firmRow);
    } else if (!firmRow) {
      firmRow = byFirmMap.get(noFirmId)!;
    }
    firmRow.clients.push(client);
    firmRow.clientCount = firmRow.clients.length;
    firmRow.totalCharged += client.totalCharged;
    firmRow.totalRevenue += client.totalRevenue;
  }

  const byFirm = Array.from(byFirmMap.values()).sort((x, y) =>
    x.firmName.localeCompare(y.firmName)
  );

  return { byClient, byFirm };
}
