import { betterAuth } from "better-auth";
import { pool } from "../config/database.js";

export const ROLES = ["super_admin", "admin", "manager", "staff", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: [...ROLES],
        required: true,
        defaultValue: "staff",
        input: false,
      },
      organizationId: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
});

export type Session = typeof auth.$Infer.Session;
