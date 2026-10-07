import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { User } from '@prisma/client';

const accessSecret: Secret = process.env.JWT_ACCESS_SECRET || 'access_secret';
const refreshSecret: Secret = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export function generateAccessToken(user: Partial<User>) {
  const payload = { id: user.id, email: user.email, fullName: user.fullName };
  const options: SignOptions = { expiresIn: accessExpiresIn as any };
  return jwt.sign(payload, accessSecret, options);
}

export function generateRefreshToken(user: Partial<User>) {
  const payload = { id: user.id };
  const options: SignOptions = { expiresIn: refreshExpiresIn as any };
  return jwt.sign(payload, refreshSecret, options);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, accessSecret);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, refreshSecret);
} 