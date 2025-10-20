import { ApiError, ApiErrorCode } from './types';
import { showNotification } from '@src/utils/notifications';
import { getMessage } from '@src/utils/i18n';

export function createApiError(error: unknown, context: string): ApiError {
  if (error instanceof Error) {
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return {
        code: ApiErrorCode.NETWORK_ERROR,
        message: getMessage('errorNetwork') || 'Network error occurred',
        details: `${context}: ${error.message}`,
        retryable: true
      };
    }
    
    if (error.message.includes('timeout')) {
      return {
        code: ApiErrorCode.TIMEOUT,
        message: getMessage('errorTimeout') || 'Request timed out',
        details: `${context}: ${error.message}`,
        retryable: true
      };
    }
    
    const statusMatch = error.message.match(/(\d{3})/);
    if (statusMatch) {
      const status = parseInt(statusMatch[1]);
      
      if (status === 429) {
        return {
          code: ApiErrorCode.RATE_LIMIT,
          message: getMessage('errorRateLimit') || 'Rate limit exceeded. Please try again later.',
          details: `${context}: ${error.message}`,
          retryable: true
        };
      }
      
      if (status === 404) {
        return {
          code: ApiErrorCode.NOT_FOUND,
          message: getMessage('errorNotFound') || 'Resource not found',
          details: `${context}: ${error.message}`,
          retryable: false
        };
      }
      
      if (status >= 500) {
        return {
          code: ApiErrorCode.SERVER_ERROR,
          message: getMessage('errorServer') || 'Server error occurred',
          details: `${context}: ${error.message}`,
          retryable: true
        };
      }
    }
    
    return {
      code: ApiErrorCode.UNKNOWN,
      message: error.message,
      details: context,
      retryable: false
    };
  }
  
  return {
    code: ApiErrorCode.UNKNOWN,
    message: 'An unknown error occurred',
    details: `${context}: ${String(error)}`,
    retryable: false
  };
}

export async function handleApiError(error: ApiError, showUserNotification: boolean = true): Promise<void> {
  console.error(`[API Error] ${error.code}: ${error.message}`, error.details);
  
  if (showUserNotification) {
    const title = getMessage('errorTitle') || 'Lichess4Chess Error';
    let message = error.message;
    
    if (error.retryable) {
      message += '\n' + (getMessage('errorRetryHint') || 'You can try again.');
    }
    
    await showNotification('error', title, message);
  }
}

export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: string,
  showUserNotification: boolean = true
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const apiError = createApiError(error, context);
    await handleApiError(apiError, showUserNotification);
    throw apiError;
  }
}
