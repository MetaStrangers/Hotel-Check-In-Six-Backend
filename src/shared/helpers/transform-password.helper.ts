import * as crypto from 'crypto';
import { promisify } from 'util';

// Promisify the callback-based crypto.pbkdf2 function
const pbkdf2Async = promisify(crypto.pbkdf2);

// Configuration
const ALGORITHM = 'pbkdf2';
const ITERATIONS = 100_000; // Security iterations (adjust over time)
const KEY_LENGTH = 64; // 64 bytes = 512 bits
const DIGEST = 'sha512'; // Cryptographic hash algorithm
const SALT_LENGTH = 16; // 16 bytes = 128 bits

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
  const derivedKey = await pbkdf2Async(password, salt, ITERATIONS, KEY_LENGTH, DIGEST);

  return `${ALGORITHM}$${DIGEST}$${ITERATIONS}$${salt}$${derivedKey.toString('hex')}`;
}

// Verify a password
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  // Split stored hash into components
  const [algorithm, digest, iterationsStr, salt, hash] = storedHash.split('$');

  // Validate algorithm format
  if (`${algorithm}${digest}` !== `${ALGORITHM}${DIGEST}`) {
    throw new Error('Invalid hashing algorithm');
  }

  // Convert string values to proper types
  const iterations = parseInt(iterationsStr, 10);

  // Generate new hash with same parameters
  const newHash = await pbkdf2Async(password, salt, iterations, KEY_LENGTH, digest);

  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(newHash.toString('hex'), hash);
}

// Constant-time comparison utility
function timingSafeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  return bufferA.length === bufferB.length && crypto.timingSafeEqual(bufferA, bufferB);
}
