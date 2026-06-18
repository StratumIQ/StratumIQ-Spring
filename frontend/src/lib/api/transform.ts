/**
 * API field-name transforms — Spring Boot uses camelCase; frontend types use snake_case.
 */

export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

export function keysToCamel<T = unknown>(value: unknown): T {
  if (value === null || value === undefined) return value as T;
  if (Array.isArray(value)) return value.map((item) => keysToCamel(item)) as T;
  if (typeof value !== "object") return value as T;

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[snakeToCamel(k)] = keysToCamel(v);
  }
  return out as T;
}

export function keysToSnake<T = unknown>(value: unknown): T {
  if (value === null || value === undefined) return value as T;
  if (Array.isArray(value)) return value.map((item) => keysToSnake(item)) as T;
  if (typeof value !== "object") return value as T;

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[camelToSnake(k)] = keysToSnake(v);
  }
  return out as T;
}
