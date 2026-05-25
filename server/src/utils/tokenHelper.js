import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: ACCESS_TOKEN_SECRET (or JWT_SECRET) is not set. Refusing to start with an insecure default.');
}

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};