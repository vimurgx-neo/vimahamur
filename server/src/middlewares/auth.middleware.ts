import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AuthRequest extends Request { user?: { id: string; role: 'Customer' | 'Admin' }; }
export function requireAuth(request: AuthRequest, response: Response, next: NextFunction): void {
  const token = request.header('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) { response.status(401).json({ message: 'Authentication is required.' }); return; }
  try { request.user = jwt.verify(token, env.jwtSecret) as { id: string; role: 'Customer' | 'Admin' }; next(); }
  catch { response.status(401).json({ message: 'Your session is invalid or expired.' }); }
}
export function requireRole(...roles: Array<'Customer' | 'Admin'>) { return (request: AuthRequest, response: Response, next: NextFunction): void => { if (!request.user || !roles.includes(request.user.role)) { response.status(403).json({ message: 'You do not have access to this resource.' }); return; } next(); }; }
