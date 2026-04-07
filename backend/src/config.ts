import dotenv from 'dotenv';
dotenv.config();

/**
 * 🔒 Centralized Security Configuration
 * 
 * In production, JWT_SECRET must be set in the environment.
 * For development, we use a single, consistent fallback to prevent HMAC verification failures
 * across different modules (auth, middleware, and claim adjudication).
 */
export const JWT_SECRET = process.env.JWT_SECRET || 'kavach_pay_dev_fallback_secret_2026';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ WARNING: JWT_SECRET is not set in production. Security is compromised!');
}
