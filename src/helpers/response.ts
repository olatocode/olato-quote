import type { ApiResponse } from '../types';

export const successResponse = <T>(data: T, message: string): ApiResponse<T> => ({
  data,
  status: 'ok',
  message,
});

export const errorResponse = (message: string, availableCategories?: string[]): ApiResponse<null> => ({
  data: null,
  status: 'error',
  message,
  ...(availableCategories && { availableCategories }),
});
