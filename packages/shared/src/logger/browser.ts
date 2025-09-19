type LogContext = Record<string, unknown> | unknown;

const serialize = (ctx?: LogContext) => {
  if (ctx === undefined) return undefined;
  if (ctx instanceof Error) return { err: { message: ctx.message, stack: ctx.stack } };
  if (typeof ctx === 'object') return ctx as Record<string, unknown>;
  return { value: ctx };
};

const isDebug = (() => {
  try {
    const g: any = globalThis as any;
    if (typeof g.DEVOLUNCH_DEBUG === 'boolean') return g.DEVOLUNCH_DEBUG;
    if (typeof window !== 'undefined' && window.location) {
      return /localhost|127\.0\.0\.1/.test(window.location.hostname);
    }
  } catch {
    // ignore
  }
  return false;
})();

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
    if (!isDebug) return;
    if (msg) console.debug(msg, serialize(context));
    else if (context) console.debug(context);
  },
};

export type Logger = typeof logger;
export default logger;
