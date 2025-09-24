import pino from 'pino';

const logLevel = process.env.LOG_LEVEL || 'info';
const isDevelopment = process.env.NODE_ENV === 'development';

const loggerOptions = isDevelopment
  ? {
      level: logLevel,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        }
      }
    }
  : {
      formatters: {
        level: (label: string): object => ({ severity: severity(label) }),
      },
      base: null,
      // Google Cloud Logging prefers a 'message' key
      messageKey: 'message',
      timestamp: false,
      level: logLevel,
    };

function severity(label: string): string {
  switch (label) {
    case 'trace':
      return 'DEBUG';
    case 'debug':
      return 'DEBUG';
    case 'info':
      return 'INFO';
    case 'warn':
      return 'WARNING';
    case 'error':
      return 'ERROR';
    case 'fatal':
      return 'CRITICAL';
    default:
      return 'DEFAULT';
  }
}

export const logger = pino(loggerOptions) as Logger;
export default logger;
export type Logger = pino.Logger;
