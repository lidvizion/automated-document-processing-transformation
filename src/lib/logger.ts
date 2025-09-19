// Simple logging utility for deployment compatibility
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
}

// Simple logger functions that are deployment-safe
export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, context);
    }
  },
  
  info: (message: string, context?: Record<string, unknown>) => {
    console.info(`[INFO] ${message}`, context);
  },
  
  warn: (message: string, context?: Record<string, unknown>) => {
    console.warn(`[WARN] ${message}`, context);
  },
  
  error: (message: string, context?: Record<string, unknown>) => {
    console.error(`[ERROR] ${message}`, context);
  },
  
  // Simple log method for compatibility
  log: (level: LogLevel, message: string, context?: Record<string, unknown>) => {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      context,
    };
    
    switch (level) {
      case LogLevel.DEBUG:
        logger.debug(message, context);
        break;
      case LogLevel.INFO:
        logger.info(message, context);
        break;
      case LogLevel.WARN:
        logger.warn(message, context);
        break;
      case LogLevel.ERROR:
        logger.error(message, context);
        break;
    }
    
    // Store in localStorage for development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      try {
        const logs = JSON.parse(localStorage.getItem('processingLogs') || '[]');
        logs.push(logEntry);
        localStorage.setItem('processingLogs', JSON.stringify(logs.slice(-100))); // Keep last 100 logs
      } catch {
        // Ignore localStorage errors
      }
    }
  },
  
  // Simple methods for compatibility with existing code
  getLogs: (): LogEntry[] => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('processingLogs') || '[]');
      } catch {
        return [];
      }
    }
    return [];
  },
  
  clearLogs: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('processingLogs');
    }
  }
};