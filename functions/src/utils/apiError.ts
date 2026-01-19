/**
 * Standard API error used across the backend.
 */
export class ApiError extends Error {
  public readonly status:number;
  public readonly code:string;
  public readonly retryAfter?: number;

  /**
   * Creates an instance of ApiError.
   * @param {number} status - The HTTP status code
   * @param {string} code - The error code
   * @param {string} message - The error message
   * @param {number} [retryAfter] - Optional retry-after duration in seconds
   */
  constructor(
    status:number,
    code:string,
    message:string,
    retryAfter?: number
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
  }
}
