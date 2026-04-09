/**
 * Runtime type guard utilities for API responses.
 * Prevents crashes from malformed backend data.
 */

/** Check if value is a non-null object */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Check if value is a non-empty array */
export function isNonEmptyArray<T>(value: unknown): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

/** Safely parse JSON string, returning fallback on failure */
export function safeJsonParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/** Safely access nested property with fallback */
export function safeGet<T>(obj: unknown, path: string, fallback: T): T {
  try {
    const keys = path.split('.');
    let current: any = obj;
    for (const key of keys) {
      if (current == null) return fallback;
      current = current[key];
    }
    return (current as T) ?? fallback;
  } catch {
    return fallback;
  }
}

/** Validate that an API response has required fields */
export function hasRequiredFields<T extends Record<string, unknown>>(
  obj: unknown,
  fields: (keyof T)[]
): obj is T {
  if (!isObject(obj)) return false;
  return fields.every(field => field in obj);
}

/** Safely coerce a value to number */
export function toNumber(value: unknown, fallback: number = 0): number {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

/** Safely coerce a value to string */
export function toString(value: unknown, fallback: string = ''): string {
  if (typeof value === 'string') return value;
  if (value == null) return fallback;
  return String(value);
}
