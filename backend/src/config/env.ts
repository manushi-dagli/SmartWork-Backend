export const env = {
  port: Number(process.env.PORT) || 4000,
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  nodeEnv: process.env.NODE_ENV ?? "development",
  /** Secret API key required to create a super admin. Set SUPER_ADMIN_SECRET_KEY. */
  superAdminSecretKey: process.env.SUPER_ADMIN_SECRET_KEY ?? "",
  /** Secret for signing employee JWT. Set JWT_SECRET. */
  jwtSecret: process.env.JWT_SECRET ?? "change-me-in-production",
} as const;
