export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page: number;
    perPage: number;
    total: number;
  };
}

export interface PaginationQuery {
  page?: number;
  perPage?: number;
}
