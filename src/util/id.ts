import crypto from 'node:crypto';

export function randomId(): string {
  return crypto.randomBytes(4).toString('hex');
}
