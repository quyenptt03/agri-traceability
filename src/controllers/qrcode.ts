import { Request, Response } from 'express';
import { CultivationLog, FarmProduct, FarmingArea } from '../models';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';

const scanQrcode = async (req: Request, res: Response) => {
  const { id: farmProductId } = req.params;
  const farmProduct = await FarmProduct.findOne({ _id: farmProductId });
  if (!farmProduct) {
    throw new CustomError.NotFoundError(
      `No farm product with id ${farmProductId}`
    );
  }
  const cultivationLogs = await CultivationLog.find({
    farm_product: farmProductId,
  }).populate({
    path: 'activity',
    select: '_id name description amount unit',
  });

  const farmingArea = await FarmingArea.find({ _id: farmProduct.farming_area });

  res
    .status(StatusCodes.OK)
    .json({ farmProduct, cultivationLogs, farmingArea });
};

export { scanQrcode };
