import { Response } from 'express';

/**
 * Safely sends an error response with properly escaped HTML characters
 * to prevent XSS attacks
 * 
 * @param res Express response object
 * @param status HTTP status code
 * @param message Error message
 */
export const sendSafeErrorResponse = (res: Response, status: number, message: string): void => {
  // Escape HTML metacharacters to prevent XSS
  const safeMessage = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  
  res.status(status).send(safeMessage);
};

/**
 * Safely handles an error by logging it and sending a safe response
 * 
 * @param res Express response object
 * @param status HTTP status code
 * @param prefix Message prefix
 * @param error Error object
 */
export const handleSafeError = (res: Response, status: number, prefix: string, error: unknown): void => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`${prefix}: ${errorMessage}`);
  sendSafeErrorResponse(res, status, `${prefix}: ${errorMessage}`);
};