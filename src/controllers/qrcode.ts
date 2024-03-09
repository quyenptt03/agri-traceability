import { Request, Response } from 'express';
import { CultivationLog, Herd, Farm } from '../models';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';

const scanQrcode = async (req: Request, res: Response) => {
  const { id: herdId } = req.params;
  const herd = await Herd.findOne({
    _id: herdId,
  })
    .populate({
      path: 'category',
      select: '_id name description',
    })
    .populate('farm');
  if (!herdId) {
    throw new CustomError.NotFoundError(`No herd with id ${herd}`);
  }
  const cultivationLogs = await CultivationLog.find({
    herd: herdId,
  });

  res.status(StatusCodes.OK).json({ herd, cultivationLogs });
};

export { scanQrcode };
