import type {Response} from "express";

interface Meta {
  cached?: boolean;
  timestamp?: number;
  pagination?: {
    page: number;
    perPage: number;
    totalPages: number;
    totalItems?: number;
  };
}

/**
 * Sends a standardized API response.
 *
 * @template T - Type of the response data.
 * @param {Response} res - Express response object.
 * @param {T} data - Payload to send in the response.
 * @param {Meta} [meta] - Optional metadata for the response.
 */
export function ok<T>(
  res: Response,
  data: T,
  meta: Meta = {}
): void {
  res.json({
    data,
    meta: {
      timestamp: Math.floor(Date.now() / 1000),
      ...meta,
    },
  });
}


/**
 * Builds a standardized API response object used by both HTTP and Callable
 * Firebase functions.
 *
 * This helper ensures all endpoints return the same response structure,
 * making it easier for client applications (mobile or web) to consume the API.
 *
 * Standard response format:
 *
 * {
 *   data: T,
 *   pagination?: PaginationMeta,
 *   meta: {
 *     timestamp: number,
 *     cached: boolean
 *   }
 * }
 *
 * @template T - Type of the response data payload
 *
 * @param {T} data - The primary data returned by the endpoint
 *
 * @param {Object} options - Optional metadata configuration
 * @param {boolean} options.cached - Whether the response was served from cache
 * @param {Object} options.pagination - Pagination info for list endpoints
 *
 * @return {Function} A standardized API response containing data and metadata
 *
 * @example
 * // Simple response
 * return buildResponse(team, { cached: false });
 *
 * @example
 * // Paginated response
 * return buildResponse(players, {
 *   cached: true,
 *   pagination: {
 *     page: 1,
 *     perPage: 20,
 *     totalPages: 5,
 *     hasNext: true
 *   }
 * });
 */
export function buildResponse<T>(
  data: T,
  options: {
    cached?: boolean;
    pagination?: PaginationMeta;
  } = {}
): ApiResponse<T> {
  const {cached = false, pagination} = options;

  return {
    data,
    meta: {
      timestamp: Math.floor(Date.now() / 1000),
      cached,
      ...(pagination && {pagination}),
    },
  };
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  totalItems?: number;
  totalPages: number;
  hasNext: boolean;
}

export interface ApiMeta {
  timestamp: number;
  cached: boolean;
  pagination?: PaginationMeta;
}

export interface ApiResponse<T> {
  data: T;
  meta: ApiMeta;
}
