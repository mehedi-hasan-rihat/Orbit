export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; code: "VALIDATION" | "NOT_FOUND" | "UNAUTHORIZED" | "CONFLICT" | "EXPIRED" | "SERVER_ERROR"; message: string; fields?: Record<string, string[]> };

export function ok<T>(data?: T): ActionResult<T> {
  return { ok: true, data };
}

export function validationError(fields: Record<string, string[]>): ActionResult {
  return { ok: false, code: "VALIDATION", message: "Validation failed.", fields };
}

export function fieldError(field: string, message: string): ActionResult {
  return { ok: false, code: "VALIDATION", message, fields: { [field]: [message] } };
}

export function notFound(message = "Not found."): ActionResult {
  return { ok: false, code: "NOT_FOUND", message };
}

export function unauthorized(message = "Unauthorized."): ActionResult {
  return { ok: false, code: "UNAUTHORIZED", message };
}

export function conflict(message: string): ActionResult {
  return { ok: false, code: "CONFLICT", message };
}

export function expired(message: string, extra?: Record<string, unknown>): ActionResult & Record<string, unknown> {
  return { ok: false, code: "EXPIRED", message, ...extra };
}

export function serverError(err?: unknown): ActionResult {
  if (err) console.error("[server-error]", err);
  return { ok: false, code: "SERVER_ERROR", message: "Something went wrong. Please try again." };
}
