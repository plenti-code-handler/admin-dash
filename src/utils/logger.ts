type LogLevel = 'info' | 'error' | 'warn' | 'debug';

interface Logger {
  info: (message: string, data?: unknown) => void;
  error: (message: string, error?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  debug: (message: string, data?: unknown) => void;
}

export const logger: Logger = {
  info: (message: string, data?: unknown) => {
    if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
      console.log(`[INFO] ${message}`, data);
    }
  },
  error: (message: string, error?: unknown) => {
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message: string, data?: unknown) => {
    console.warn(`[WARN] ${message}`, data);
  },
  debug: (message: string, data?: unknown) => {
    if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }
};