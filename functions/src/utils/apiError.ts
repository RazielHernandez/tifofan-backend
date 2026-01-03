/**
 * Standard API error used across the backend.
 */
export class ApiError extends Error {
  public readonly status:number;
  public readonly code:string;

  /**
   * Creates an instance of ApiError.
   * @param {number} status - The HTTP status code
   * @param {string} code - The error code
   * @param {string} message - The error message
   */
  constructor(
    status:number,
    code:string,
    message:string
  ) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
