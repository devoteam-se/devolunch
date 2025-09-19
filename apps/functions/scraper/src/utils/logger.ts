import pino from 'pino';

const logLevel = process.env.LOG_LEVEL || 'info';

const loggerOptions = {
  formatters: {
    level: (label: string): object => ({ severity: severity(label) }),
  },
  base: null,
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

export const logger = pino(loggerOptions);
export type Logger = pino.Logger;

