/**
 * Simple utility for async error handling with proper logging
 */
export async function tryOrNull<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    if (context) {
      console.warn(`[${context}] failed:`, error instanceof Error ? error.message : error);
    }
    return null;
  }
}