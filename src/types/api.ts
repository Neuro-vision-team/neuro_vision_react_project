// ─── API envelope (every backend response) ────────────────────────────────────
export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
};

// ─── Laravel paginated response ───────────────────────────────────────────────
export type PaginatedRaw<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  // optional links Laravel includes
  first_page_url?: string;
  last_page_url?: string;
  next_page_url?: string | null;
  prev_page_url?: string | null;
};

// ─── Frontend paginated result (camelCase) ────────────────────────────────────
export type PaginatedResult<T> = {
  items: T[];
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
};

// ─── Typed API error thrown by the client ────────────────────────────────────
export class ApiError extends Error {
  readonly status: number;
  readonly errors?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

// ─── Common query param shapes ────────────────────────────────────────────────
export type PageParams = { page?: number; per_page?: number };
