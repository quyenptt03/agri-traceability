import User from '../models/User';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import { Response, Request } from 'express';
import { attachCookiesToResponse, createUserToken } from '../utils';

import {
  LoggingService,
  LoginService,
  AnalyticsService,
} from '../services/login-service';

const register = async (req: Request, res: Response) => {
  const { first_name, last_name, email, password } = req.body;
  const emailAlreadyExist = await User.findOne({ email });

  if (emailAlreadyExist) {
    throw new CustomError.BadRequestError('Email already exists');
  }

  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? 'admin' : 'user';

  const user = await User.create({
    first_name,
    last_name,
    email,
    password,
    role,
  });
  const userToken = createUserToken(user);
  const token = attachCookiesToResponse({ res, user: userToken });
  res.status(StatusCodes.CREATED).json({ user: userToken, token });
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide email and password.');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid credentials');
  }

  const isCorrectPassword = await user.comparePassword(password);
  if (!isCorrectPassword) {
    throw new CustomError.UnauthenticatedError('Incorrect email or password');
  }

  const userToken = createUserToken(user);
  const token = attachCookiesToResponse({ res, user: userToken });

  res.status(StatusCodes.OK).json({ user: userToken, token });
};

const loginService = new LoginService();
const loggingService = new LoggingService();
const analyticsService = new AnalyticsService();

loginService.addObserver(loggingService);
loginService.addObserver(analyticsService);

const register2 = async (req: Request, res: Response) => {
  const { first_name, last_name, email, password } = req.body;

  if (!email || !password || !first_name || !last_name) {
    throw new CustomError.BadRequestError('Please provide all infomation');
  }

  const userToken = await loginService.register(
    email,
    password,
    first_name,
    last_name
  );
  const token = attachCookiesToResponse({ res, user: userToken });

  res.status(StatusCodes.CREATED).json({ user: userToken, token });
};

const login2 = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide email and password.');
  }

  const userToken = await loginService.login(email, password);
  const token = attachCookiesToResponse({ res, user: userToken });
  res.status(200).json({ user: userToken, token });
};

const logout = async (req: Request, res: Response) => {
  res.cookie('token', '', {
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: 'user logged out' });
};

const logout2 = async (req: Request, res: Response) => {
  //@ts-ignore
  const user = req.user;
  const result = await loginService.logout(user);
  if (result) {
    res.cookie('token', '', {
      expires: new Date(Date.now()),
    });
    res.status(StatusCodes.OK).json({ message: 'Logout successful' });
  } else {
    res.status(StatusCodes.BAD_REQUEST).json({ message: 'Logout failed' });
  }
};

const getActiveUser = async (req: Request, res: Response) => {
  const result = loginService.getActiveUsers();
  res.status(200).json({ users: result, count: result.length });
};

export { register, login, logout, login2, logout2, register2, getActiveUser };
