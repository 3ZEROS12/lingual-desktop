import fs from "node:fs";
import path from "node:path";
import { getConfigDir } from "./config.js";

const MAX_LOG_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB cap

export function getLogFilePath(): string {
  const dir = getConfigDir();
  return path.join(dir, "runtime.log");
}

function rotateIfNeeded(logPath: string): void {
  try {
    if (fs.existsSync(logPath)) {
      const stats = fs.statSync(logPath);
      if (stats.size > MAX_LOG_SIZE_BYTES) {
        const backupPath = `${logPath}.1`;
        try {
          if (fs.existsSync(backupPath)) {
            fs.unlinkSync(backupPath);
          }
          fs.renameSync(logPath, backupPath);
        } catch {}
      }
    }
  } catch {}
}

function appendLogLine(level: string, tag: string, message: string): void {
  try {
    const logPath = getLogFilePath();
    rotateIfNeeded(logPath);
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] [${level}] [${tag}] ${message}\n`;
    fs.appendFileSync(logPath, line, "utf8");
  } catch {}
}

function formatArgs(args: any[]): string {
  return args
    .map((arg) => {
      if (arg instanceof Error) {
        return `${arg.name}: ${arg.message}\n${arg.stack || ""}`;
      }
      if (typeof arg === "object" && arg !== null) {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    })
    .join(" ");
}

export const logger = {
  info(tag: string, ...args: any[]): void {
    const msg = formatArgs(args);
    appendLogLine("INFO", tag, msg);
    console.log(`[${tag}] ${msg}`);
  },

  warn(tag: string, ...args: any[]): void {
    const msg = formatArgs(args);
    appendLogLine("WARN", tag, msg);
    console.warn(`[${tag}] ${msg}`);
  },

  error(tag: string, ...args: any[]): void {
    const msg = formatArgs(args);
    appendLogLine("ERROR", tag, msg);
    console.error(`[${tag}] ${msg}`);
  },

  debug(tag: string, ...args: any[]): void {
    const msg = formatArgs(args);
    appendLogLine("DEBUG", tag, msg);
  },
};

export async function openLogFile(): Promise<string> {
  const logPath = getLogFilePath();
  if (!fs.existsSync(logPath)) {
    try {
      fs.writeFileSync(logPath, `[${new Date().toISOString()}] [INFO] [init] Log file initialized.\n`, "utf8");
    } catch {}
  }
  try {
    const { shell } = await import("electron");
    if (shell && typeof shell.openPath === "function") {
      return await shell.openPath(logPath);
    }
  } catch {}
  return logPath;
}

export function readRecentLogs(lineCount = 100): string {
  try {
    const logPath = getLogFilePath();
    if (!fs.existsSync(logPath)) return "No logs recorded yet.";
    const content = fs.readFileSync(logPath, "utf8");
    const lines = content.split("\n");
    return lines.slice(-lineCount).join("\n");
  } catch (err: any) {
    return `Error reading logs: ${err.message}`;
  }
}

/**
 * Initializes global crash guards and hooks
 */
export function initLogger(): void {
  const logPath = getLogFilePath();
  logger.info("system", `Lingual runtime logger initialized. Path: ${logPath}`);

  process.on("uncaughtException", (err) => {
    logger.error("crash:uncaughtException", err);
  });

  process.on("unhandledRejection", (reason) => {
    logger.error("crash:unhandledRejection", reason);
  });
}
