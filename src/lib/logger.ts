import morgan, { type StreamOptions } from "morgan";
import winston from "winston";

/** Mirrors distinct-backend `packages/backend-service/src/config/logger.ts`. */
const logLevel = process.env.LOG_LEVEL ?? "debug";

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({
    colors: {
      info: "blue",
      error: "red",
      warn: "yellow",
      http: "green",
      debug: "white",
    },
    all: true,
  }),
  winston.format.errors({ stack: true }),
  winston.format.printf(
    (info) =>
      `UserId ${info.userId === undefined ? "N/A" : String(info.userId)} : IP ${
        info.ipAddress === undefined ? "N/A" : String(info.ipAddress)
      } : RequestId ${info.requestId === undefined ? "N/A" : String(info.requestId)} : ${info.timestamp} ${
        info.level
      }: ${info.message}`,
  ),
);

const transports = [new winston.transports.Console()];

export const logger = winston.createLogger({
  level: logLevel,
  format,
  transports,
});

const stream: StreamOptions = {
  write: (message: string) => {
    logger.http(message.trimEnd());
  },
};

export const morganMiddleware = morgan(":method :url :status :res[content-length] - :response-time ms", {
  stream,
});
