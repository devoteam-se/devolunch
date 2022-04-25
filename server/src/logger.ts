/**
 * Log api for mapping pino to stack driver format.
 *
 * See https://cloud.google.com/run/docs/logging.
 */
import pino from 'pino';

const logLevel = process.env.LOG_LEVEL || 'info';

const loggerOptions = {
  formatters: {
    level: (label: string, _number: number): object => ({ severity: severity(label) })
  },
  base: null,
  //  Google Cloud Logging also prefers that log data is present inside a message key instead of the default msg key that Pino uses.
  messageKey: 'message',
  timestamp: false,
  level: logLevel
};

// Map pino levels to GCP, https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#LogSeverity
function severity(label: string): string {
  switch (label) {
    case 'trace': return 'DEBUG';
    case 'debug': return 'DEBUG';
    case 'info': return 'INFO';
    case 'warn': return 'WARNING';
    case 'error': return 'ERROR';
    case 'fatal': return 'CRITICAL';
    default: return 'DEFAULT';
  }
}

const logger = pino(loggerOptions) as Logger;

export type Logger = pino.Logger;
export default logger;
