/**
 * Structured Logger Implementation
 * Provides pluggable logging with production and development modes
 */

export interface LogData {
  [key: string]: unknown;
}

export interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  data?: LogData;
}

export interface Logger {
  warn(message: string, data?: LogData): void;
  info(message: string, data?: LogData): void;
  error(message: string, data?: LogData): void;
  debug(message: string, data?: LogData): void;
  flush?(): Promise<void>;
}

/**
 * Console Logger - Development fallback
 */
class ConsoleLogger implements Logger {
  private formatLogEntry(level: string, message: string, data?: LogData): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(data && { data })
    };
  }

  warn(message: string, data?: LogData): void {
    const entry = this.formatLogEntry('WARN', message, data);
    console.warn(JSON.stringify(entry));
  }

  info(message: string, data?: LogData): void {
    const entry = this.formatLogEntry('INFO', message, data);
    console.info(JSON.stringify(entry));
  }

  error(message: string, data?: LogData): void {
    const entry = this.formatLogEntry('ERROR', message, data);
    console.error(JSON.stringify(entry));
  }

  debug(message: string, data?: LogData): void {
    const entry = this.formatLogEntry('DEBUG', message, data);
    console.debug(JSON.stringify(entry));
  }
}

/**
 * Production Logger - Extensible for Winston/Pino integration
 */
class ProductionLogger implements Logger {
  private transports: Array<(entry: LogEntry) => void | Promise<void>> = [];
  private pendingLogs: Promise<void>[] = [];
  private rotatingStream: NodeJS.WritableStream | null = null; // rotating-file-stream instance

  constructor() {
    // Initialize production transports
    this.initializeTransports();
  }

  private initializeTransports(): void {
    // Console transport for immediate visibility
    this.transports.push((entry: LogEntry) => {
      console.log(JSON.stringify(entry));
    });

    // Add file transport if configured
    if (process.env.LOG_FILE_PATH) {
      this.addFileTransport(process.env.LOG_FILE_PATH);
    }

    // Add external service transport if configured
    if (process.env.LOG_SERVICE_URL) {
      this.addServiceTransport(process.env.LOG_SERVICE_URL);
    }
  }

  private addFileTransport(filePath: string): void {
    try {
      // Initialize rotating file stream
      this.initializeRotatingFileStream(filePath);
      
      // Add transport that uses the rotating stream
      this.transports.push(async (entry: LogEntry) => {
        try {
          if (this.rotatingStream) {
            const logLine = JSON.stringify(entry) + '\n';
            this.rotatingStream.write(logLine);
          } else {
            throw new Error('Rotating stream not initialized');
          }
        } catch (error) {
          // Fallback to console if file write fails
          console.error('Failed to write to rotating log file:', error);
          console.log(JSON.stringify(entry));
        }
      });
    } catch (error) {
      console.error('Failed to initialize rotating file transport:', error);
      console.log('File logging disabled, using console only');
    }
  }

  private async initializeRotatingFileStream(filePath: string): Promise<void> {
    try {
      // Dynamic import to handle optional dependency
      const rfs = await import('rotating-file-stream').catch(() => null);
      
      if (!rfs) {
        // Fallback to basic file transport if rotating-file-stream is not available
        console.warn('rotating-file-stream package not found, using basic file transport');
        this.addBasicFileTransport(filePath);
        return;
      }

      const path = await import('path');
      const fs = await import('fs/promises');

      // Extract directory and filename
      const logDir = path.dirname(filePath);
      const logFileName = path.basename(filePath);

      // Validate/create log directory
      try {
        await fs.access(logDir);
      } catch {
        await fs.mkdir(logDir, { recursive: true });
      }

      // Test write permissions
      const testFile = path.join(logDir, '.write-test');
      try {
        await fs.writeFile(testFile, 'test');
        await fs.unlink(testFile);
      } catch {
        throw new Error(`No write permissions for log directory: ${logDir}`);
      }

      // Configure rotation options
      const rotationOptions = {
        // Size-based rotation (default: 10MB per file)
        size: process.env.LOG_MAX_SIZE || '10M',
        
        // Time-based rotation (default: daily)
        interval: process.env.LOG_ROTATION_INTERVAL || '1d',
        
        // Keep max files (default: 14 days for daily rotation)
        maxFiles: parseInt(process.env.LOG_MAX_FILES || '14'),
        
        // Compress old files
        compress: process.env.LOG_COMPRESS !== 'false',
        
        // File path configuration
        path: logDir,
      };

      // Create rotating stream
      this.rotatingStream = rfs.createStream(logFileName, rotationOptions);

      // Handle stream errors
      this.rotatingStream.on('error', (error: Error) => {
        console.error('Rotating file stream error:', error);
      });

      this.rotatingStream.on('warning', (warning: Error) => {
        console.warn('Rotating file stream warning:', warning);
      });

      // Log successful initialization
      console.log(`Initialized rotating file logger: ${filePath}`, {
        maxSize: rotationOptions.size,
        interval: rotationOptions.interval,
        maxFiles: rotationOptions.maxFiles,
        compress: rotationOptions.compress,
      });

    } catch (error) {
      throw new Error(`Failed to initialize rotating file stream: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private addBasicFileTransport(filePath: string): void {
    // Fallback to basic file transport (original implementation)
    this.transports.push(async (entry: LogEntry) => {
      try {
        const fs = await import('fs/promises');
        const logLine = JSON.stringify(entry) + '\n';
        await fs.appendFile(filePath, logLine);
      } catch (error) {
        // Fallback to console if file write fails
        console.error('Failed to write to log file:', error);
        console.log(JSON.stringify(entry));
      }
    });
  }

  private addServiceTransport(serviceUrl: string): void {
    // Configurable timeout (default: 3 seconds)
    const timeoutMs = parseInt(process.env.LOG_SERVICE_TIMEOUT_MS || '3000', 10);
    
    this.transports.push(async (entry: LogEntry) => {
      const controller = new AbortController();
      let timeoutId: NodeJS.Timeout | null = null;
      
      try {
        // Set up timeout that aborts the request
        timeoutId = setTimeout(() => {
          controller.abort();
        }, timeoutMs);

        await fetch(serviceUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry),
          signal: controller.signal,
        });

        // Clear timeout on successful completion
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      } catch (error) {
        // Clear timeout in case of any error
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        // Handle specific abort error vs other fetch errors
        if (error instanceof Error && error.name === 'AbortError') {
          console.error(`Log service request timed out after ${timeoutMs}ms:`, error.message);
        } else {
          console.error('Failed to send log to service:', error);
        }
        
        // Fallback to console in all error cases
        console.log(JSON.stringify(entry));
      }
    });
  }

  private formatLogEntry(level: string, message: string, data?: LogData): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(data && { data })
    };
  }

  private async writeLog(level: string, message: string, data?: LogData): Promise<void> {
    const entry = this.formatLogEntry(level, message, data);
    
    const logPromises = this.transports.map(async (transport) => {
      try {
        await transport(entry);
      } catch (error) {
        // Individual transport failures shouldn't break other transports
        console.error('Transport error:', error);
      }
    });

    // Track pending logs for flush operation
    const logPromise = Promise.allSettled(logPromises).then(() => {});
    this.pendingLogs.push(logPromise);

    // Clean up completed logs to prevent memory leaks
    if (this.pendingLogs.length > 100) {
      this.pendingLogs = this.pendingLogs.slice(-50);
    }
  }

  warn(message: string, data?: LogData): void {
    this.writeLog('WARN', message, data).catch((error) => {
      console.error('Logger error:', error);
    });
  }

  info(message: string, data?: LogData): void {
    this.writeLog('INFO', message, data).catch((error) => {
      console.error('Logger error:', error);
    });
  }

  error(message: string, data?: LogData): void {
    this.writeLog('ERROR', message, data).catch((error) => {
      console.error('Logger error:', error);
    });
  }

  debug(message: string, data?: LogData): void {
    // Only log debug in development or when explicitly enabled
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_LOGGING === 'true') {
      this.writeLog('DEBUG', message, data).catch((error) => {
        console.error('Logger error:', error);
      });
    }
  }

  async flush(): Promise<void> {
    try {
      await Promise.allSettled(this.pendingLogs);
      this.pendingLogs = [];

      // Close the rotating file stream if it exists
      if (this.rotatingStream) {
        return new Promise((resolve, reject) => {
          this.rotatingStream!.end((error?: Error) => {
            if (error) {
              console.error('Error closing rotating stream:', error);
              reject(error);
            } else {
              resolve();
            }
          });
        });
      }
    } catch (error) {
      console.error('Error flushing logs:', error);
    }
  }
}

/**
 * Logger Factory - Environment-based initialization
 */
function createLogger(): Logger {
  const isProduction = process.env.NODE_ENV === 'production';
  const forceConsole = process.env.FORCE_CONSOLE_LOGGING === 'true';

  if (isProduction && !forceConsole) {
    return new ProductionLogger();
  } else {
    return new ConsoleLogger();
  }
}

/**
 * Global logger instance - Singleton pattern for consistent usage
 */
let loggerInstance: Logger | null = null;

export function getLogger(): Logger {
  if (!loggerInstance) {
    loggerInstance = createLogger();
  }
  return loggerInstance;
}

/**
 * Graceful shutdown helper for production loggers
 */
export async function shutdownLogger(): Promise<void> {
  if (loggerInstance && 'flush' in loggerInstance && typeof loggerInstance.flush === 'function') {
    try {
      await loggerInstance.flush();
    } catch (error) {
      console.error('Error during logger shutdown:', error);
    }
  }
}

/**
 * Security-specific logger wrapper for consistent security event logging
 */
export const securityLogger = {
  warn: (message: string, data?: LogData) => {
    getLogger().warn(`[SECURITY] ${message}`, data);
  },
  info: (message: string, data?: LogData) => {
    getLogger().info(`[SECURITY] ${message}`, data);
  },
  error: (message: string, data?: LogData) => {
    getLogger().error(`[SECURITY] ${message}`, data);
  }
};

/**
 * Environment Variables for Configuration:
 * 
 * NODE_ENV=production                 - Enables production logger
 * FORCE_CONSOLE_LOGGING=true         - Forces console logger even in production
 * DEBUG_LOGGING=true                 - Enables debug logging
 * LOG_FILE_PATH=/var/log/app.log     - Enables file transport
 * LOG_SERVICE_URL=https://logs.service.com/api - Enables service transport
 */