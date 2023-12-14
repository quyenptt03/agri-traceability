import CustomError from '../errors';
import { isTokenValid } from '../utils';
import { NextFunction, Request, Response } from 'express';

const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;
  //check header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  }

  //check cookies
  else if (req.signedCookies.token) {
    token = req.signedCookies.token;
  }
  if (!token) {
    throw new CustomError.UnauthenticatedError('No token provided');
  }
  try {
    const payload = isTokenValid(token);
    // @ts-ignore
    req.user = {
      // @ts-ignore
      name: payload.name,
      // @ts-ignore
      email: payload.email,
      // @ts-ignore
      userId: payload.userId,
      // @ts-ignore
      role: payload.role,
    };
    next();
  } catch (error) {
    console.log(error);
    throw new CustomError.UnauthenticatedError('Authentication invalid');
  }
};

const authorizePermissions = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        'Unauthorized to access this route'
      );
    }
    next();
  };
};

export { authenticateUser, authorizePermissions };
