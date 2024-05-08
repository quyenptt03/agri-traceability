import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import CustomError from '../errors';

const createJWT = ({ payload }: { payload: object }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFE_TIME || '1d',
  });
  return token;
};

const isTokenValid = (token: string) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload;
  } catch (error) {
    throw new CustomError.UnauthenticatedError('Authentication invalid');
  }
};

const attachCookiesToResponse = ({
  res,
  user,
}: {
  res: Response;
  user: any;
}) => {
  const token = createJWT({ payload: user });
  const oneDay = 1000 * 60 * 60 * 24;
  res.cookie('token', token, {
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production',
    signed: true,
  });
  return token;
};

export { createJWT, isTokenValid, attachCookiesToResponse };
