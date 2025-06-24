import * as winston from "winston";
import { load_config } from "../config/config";

const config = load_config();

export function createLogger(name: string): winston.Logger {
  return winston.createLogger({
    level: config.log_level,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${name}] ${level}: ${message}`;
      }),
      // winston.format.json(),
      winston.format.errors({ stack: true })
    ),
    transports: [new winston.transports.Console()],
  });
}
