import path from 'path';

import mongoose from 'mongoose';
import winston from 'winston';

class ServerGlobal {
  private readonly _logger: winston.Logger;

  private static _instance: ServerGlobal;

  private constructor() {
    this._logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        // new winston.transports.File({
        //   filename: path.join(__dirname, '../logs.log'),
        //   level: 'info',
        // }),
      ],
    });
  }

  static getInstance() {
    if (!this._instance) {
      this._instance = new ServerGlobal();
    }

    return this._instance;
  }

  public get logger() {
    return this._logger;
  }

  public async connectDB(uri: string) {
    mongoose
      .connect(uri)
      .then(() => this._logger.info('Connect db successfull'))
      .catch((e: mongoose.Error) =>
        this._logger.error(`DB connection failed with error: ${e}`)
      );
  }
}

export default ServerGlobal;
