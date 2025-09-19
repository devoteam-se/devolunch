type LogContext = Record<string, unknown> | unknown;

const serialize = (ctx?: LogContext) => {
  if (ctx === undefined) return undefined;
  if (ctx instanceof Error) return { err: { message: ctx.message, stack: ctx.stack } };
  if (typeof ctx === 'object') return ctx as Record<string, unknown>;
  return { value: ctx };
};

export const logger = {
  info: (context?: LogContext, msg?: string) => {
    if (msg) console.info(msg, serialize(context));
    else if (context) console.info(context);
  },
  warn: (context?: LogContext, msg?: string) => {
    if (msg) console.warn(msg, serialize(context));
    else if (context) console.warn(context);
  },
  error: (context?: LogContext, msg?: string) => {
    if (msg) console.error(msg, serialize(context));
    else if (context) console.error(context);
  },
  debug: (context?: LogContext, msg?: string) => {
    if (import.meta.env?.DEV) {
      if (msg) console.debug(msg, serialize(context));
      else if (context) console.debug(context);
    }
  },
};

export type Logger = typeof logger;

