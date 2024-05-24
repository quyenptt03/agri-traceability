import { User } from '../models';
import { createUserToken } from '../utils';
import CustomError from '../errors';

class AuthenticationService {
  private static _instance: AuthenticationService;

  constructor() {}

  static getInstance() {
    if (!AuthenticationService._instance) {
      AuthenticationService._instance = new AuthenticationService();
    }

    return AuthenticationService._instance;
  }

  async login(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError.UnauthenticatedError('Invalid credentials');
    }

    const isCorrectPassword = await user.comparePassword(password);
    if (!isCorrectPassword) {
      throw new CustomError.UnauthenticatedError('Incorrect email or password');
    }

    const userToken = createUserToken(user);
    return userToken;
  }

  async register(
    email: string,
    password: string,
    first_name: string,
    last_name: string
  ) {
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
    return userToken;
  }
}

export default AuthenticationService;
