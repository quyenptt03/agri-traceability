import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { User } from '../models';
import CustomError from '../errors';
import {
  attachCookiesToResponse,
  checkPermission,
  createUserToken,
} from '../utils';

const createUser = async (req: Request, res: Response) => {
  const { email, first_name, last_name, password, role } = req.body;
  const emailAlreadyExist = await User.findOne({ email });

  if (emailAlreadyExist) {
    throw new CustomError.BadRequestError('Email already exists');
  }

  const user = await User.create({
    first_name,
    last_name,
    email,
    password,
    role,
  });
  res.status(StatusCodes.CREATED).json({ user });
};

const getAllUsers = async (req: Request, res: Response) => {
  const roles = ['user', 'manager'];
  const users = await User.find({ role: { $in: roles } }).select('-password');
  res.status(StatusCodes.OK).json({ users, count: users.length });
};

const getSingleUser = async (req: Request, res: Response) => {
  const { id: userId } = req.params;
  const user = await User.findOne({ _id: userId }).select('-password');
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id: ${req.params.id}`);
  }

  // @ts-ignore
  checkPermission(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};
const showCurrentUser = async (req: Request, res: Response) => {
  // @ts-ignore
  res.status(StatusCodes.OK).json({ user: req.user });
};
const updateUser = async (req: Request, res: Response) => {
  // @ts-ignore
  const user = await User.findOneAndUpdate({ _id: req.user.userId }, req.body, {
    runValidators: true,
    new: true,
  }).select('-password');

  const tokenUser = createUserToken(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user });
};
const changePassword = async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError('Please provide both values');
  }

  // @ts-ignore
  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Incorrect old password');
  }
  user.password = newPassword;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: 'Success! Password updated. ' });
};

const changeUserRole = async (req: Request, res: Response) => {
  const { role } = req.body;
  const user = await User.findOne({ _id: req.params.id }).select('-password');
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id: ${req.params.id}`);
  }

  user.role = role;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: 'Sucess! Role updated' });
};

export {
  createUser,
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  changePassword,
  changeUserRole,
};
