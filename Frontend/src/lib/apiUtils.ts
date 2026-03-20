/**
 * Check if mock data mode is enabled.
 * When true, services will use local mock data instead of API calls.
 */
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

/**
 * Wrapper for API calls with fallback to mock data.
 *
 * @param apiCall - Async function that makes the API call
 * @param mockData - Mock data to return if API fails or mock mode is enabled
 * @param label - Label for logging
 */
export async function withFallback<T>(
  apiCall: () => Promise<T>,
  mockData: T | (() => T),
  label = 'API'
): Promise<T> {
  // If mock mode is explicitly enabled, skip API
  if (USE_MOCK_DATA) {
    console.log(`[${label}] Using mock data (VITE_USE_MOCK_DATA=true)`);
    return typeof mockData === 'function' ? (mockData as () => T)() : mockData;
  }

  // Try the real API; fall back to mock data on any error
  try {
    return await apiCall();
  } catch (err) {
    console.warn(`[${label}] API call failed, falling back to mock data:`, err);
    return typeof mockData === 'function' ? (mockData as () => T)() : mockData;
  }
}

/**
 * Snake_case to camelCase converter for API responses.
 */
export function toCamelCase<T>(obj: unknown): T {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase) as T;
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj as Record<string, unknown>).reduce((acc, [key, value]) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamelCase(value);
      return acc;
    }, {} as Record<string, unknown>) as T;
  }
  return obj as T;
}

/**
 * CamelCase to snake_case converter for API requests.
 */
export function toSnakeCase<T>(obj: unknown): T {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase) as T;
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj as Record<string, unknown>).reduce((acc, [key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      acc[snakeKey] = toSnakeCase(value);
      return acc;
    }, {} as Record<string, unknown>) as T;
  }
  return obj as T;
}
