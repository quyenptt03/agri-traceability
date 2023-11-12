import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import { Activity, CultivationLog, FarmProduct } from '../models';
import { v2 as cloudinary } from 'cloudinary';
import { remove, upload } from './cloudinary';

const getAllCultivationLogs = async (req: Request, res: Response) => {
  const cultivationLogs = await CultivationLog.find({}).populate({
    path: 'activity',
    select: '_id name desctiption amount unit',
  });

  res
    .status(StatusCodes.OK)
    .json({ cultivationLogs, count: cultivationLogs.length });
};

const createCultivationLog = async (req: Request, res: Response) => {
  const { farmProductId, activityId, notes } = req.body;

  if (!farmProductId || !activityId) {
    throw new CustomError.BadRequestError(
      'Please provide farm product id, activity id'
    );
  }

  const farmProduct = await FarmProduct.findOne({ _id: farmProductId });
  const activity = await Activity.findOne({ _id: activityId });

  if (!farmProduct || !activity) {
    throw new CustomError.BadRequestError(
      'Farm product or activity does not exist'
    );
  }

  const cultivationLog = await CultivationLog.create({
    farm_product: farmProduct._id,
    activity: activity._id,
    notes,
  });

  res.status(StatusCodes.CREATED).json({ cultivationLog });
};

const getCultivationLog = async (req: Request, res: Response) => {
  const { id: cultivationLogId } = req.params;
  const cultivationLog = await CultivationLog.findOne({
    _id: cultivationLogId,
  }).populate({
    path: 'activity',
    select: '_id name desctiption amount unit',
  });
  if (!cultivationLog) {
    throw new CustomError.NotFoundError(
      `No cultivation log with id ${cultivationLogId}`
    );
  }
  res.status(StatusCodes.OK).json({ cultivationLog });
};

const getCultivationLogsByFarmProduct = async (req: Request, res: Response) => {
  const { id: farmProductId } = req.params;
  const cultivationLogs = await CultivationLog.find({
    farm_product: farmProductId,
  }).populate({
    path: 'activity',
    select: '_id name desctiption amount unit',
  });

  res.status(StatusCodes.OK).json({ cultivationLogs });
};

const updateCultivationLog = async (req: Request, res: Response) => {
  const { id: cultivationLogId } = req.params;
  const { farmProductId, activityId, notes } = req.body;

  const cultivationLog = await CultivationLog.findOne({
    _id: cultivationLogId,
  });
  if (!cultivationLog) {
    throw new CustomError.NotFoundError(
      `No cultivation log with id ${cultivationLogId}`
    );
  }
  if (notes) {
    (await cultivationLog).notes = notes;
  }

  if (farmProductId) {
    const farmProduct = await FarmProduct.findOne({ _id: farmProductId });
    if (!farmProduct) {
      throw new CustomError.BadRequestError(`Farm product does not exists`);
    }
    cultivationLog.farm_product = farmProduct._id;
  }

  if (activityId) {
    const activity = await Activity.findOne({ _id: activityId });
    if (!activity) {
      throw new CustomError.BadRequestError(`Activity does not exists`);
    }
    cultivationLog.activity = activity._id;
  }
  await cultivationLog.save();
  res.status(StatusCodes.OK).json({ cultivationLog });
};

const deleteCultivationLog = async (req: Request, res: Response) => {
  const { id: cultivationLogId } = req.params;
  const cultivationLog = await CultivationLog.findOne({
    _id: cultivationLogId,
  });
  if (!cultivationLog) {
    throw new CustomError.NotFoundError(
      `No cultivation log with id ${cultivationLogId}`
    );
  }
  await cultivationLog.deleteOne();
  if (cultivationLog.images) {
    remove(cultivationLog.images);
  }
  res.status(StatusCodes.OK).json({ msg: 'Success! Cultivation log removed.' });
};

const uploadImages = async (req: Request, res: Response) => {
  if (!req.files) {
    throw new CustomError.BadRequestError('No files uploaded');
  }
  const { id: cultivationLogId } = req.params;
  const images = req.files as Express.Multer.File[];
  const imageUrls = await upload(images);

  const cultivationLog = await CultivationLog.findOne({
    _id: cultivationLogId,
  });
  if (!cultivationLog) {
    remove(imageUrls);
    throw new CustomError.NotFoundError(
      `No cultivation log with id ${cultivationLogId}`
    );
  }
  if (cultivationLog.images.length !== 0) {
    remove(cultivationLog.images);
  }

  cultivationLog.images = imageUrls;
  cultivationLog.save();

  res.status(StatusCodes.CREATED).json({ cultivationLog });
};

export {
  getAllCultivationLogs,
  createCultivationLog,
  getCultivationLog,
  getCultivationLogsByFarmProduct,
  updateCultivationLog,
  deleteCultivationLog,
  uploadImages,
};
