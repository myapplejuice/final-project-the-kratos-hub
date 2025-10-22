import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY;

export function sanitizeUserForToken(user) {
  return { id: user.id };
}

export function signJwt(payload, options = {}) {
  const defaultOptions = { algorithm: 'HS256' };
  const signOptions = { ...defaultOptions, ...options };
  return jwt.sign(payload, SECRET_KEY, signOptions);
}

export function verifyJwt(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
}