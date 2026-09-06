export interface ApiResponse<T> {
  data: T | null;
  status: 'ok' | 'error';
  message: string;
  availableCategories?: string[];
}
