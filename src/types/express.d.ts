import type { Logger } from "winston";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      logger?: Logger;
    }
  }
}

export {};
