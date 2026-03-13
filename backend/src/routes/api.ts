import { Router } from "express";
import { requireSession, requireAbility, type AuthRequest } from "../middleware/session.js";

export const apiRouter = Router();

apiRouter.use(requireSession);

apiRouter.get("/firms", requireAbility("read", "Firm"), (_req, res) => {
  res.json({ data: [], message: "Firms list (stub)" });
});

apiRouter.get("/clients", requireAbility("read", "Client"), (_req, res) => {
  res.json({ data: [], message: "Clients list (stub)" });
});

apiRouter.get("/employees", requireAbility("read", "Employee"), (_req, res) => {
  res.json({ data: [], message: "Employees list (stub)" });
});

apiRouter.get("/reports", requireAbility("read", "Report"), (_req, res) => {
  res.json({ data: [], message: "Reports (stub)" });
});
