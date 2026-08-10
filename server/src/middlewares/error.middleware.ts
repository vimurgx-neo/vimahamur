import { NextFunction, Request, Response } from 'express';

export function notFound(_request: Request, response: Response): void { response.status(404).json({ message: 'Route not found' }); }
export function errorHandler(error: Error, _request: Request, response: Response, _next: NextFunction): void {
  console.error(error);
  response.status(500).json({ message: 'An unexpected server error occurred.' });
}
