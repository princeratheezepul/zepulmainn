import crypto from 'crypto';

const RESET_TOKEN_BYTES = 32;

export const generateResetToken = (ttlMs) => {
  const plainToken = crypto.randomBytes(RESET_TOKEN_BYTES).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');
  const expiresAt = new Date(Date.now() + ttlMs);
  return { plainToken, tokenHash, expiresAt };
};

export const hashResetToken = (plainToken) => {
  if (typeof plainToken !== 'string' || plainToken.length === 0) return null;
  return crypto.createHash('sha256').update(plainToken).digest('hex');
};

export const isResetTokenValid = (storedHash, storedExpires, candidatePlain) => {
  if (!storedHash || !storedExpires || !candidatePlain) return false;
  if (new Date(storedExpires).getTime() < Date.now()) return false;
  const candidateHash = hashResetToken(candidatePlain);
  if (!candidateHash) return false;
  const a = Buffer.from(storedHash, 'hex');
  const b = Buffer.from(candidateHash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};
