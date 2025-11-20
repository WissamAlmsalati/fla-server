export const log = {
  info: (message: string, meta?: Record<string, unknown>) => {
    console.info("[info]", message, meta ?? "");
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    console.error("[error]", message, meta ?? "");
  },
};
