import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import { Activity, CultivationLog, FarmProduct } from '../models';
import { v2 as cloudinary } from 'cloudinary';

const deleteImages = async (imageUrls: object[]) => {
  const publicIds = imageUrls.map((imgUrl: any) => imgUrl.filename);
  await cloudinary.api.delete_resources(publicIds);
};

const getAllCultivationLogs = async (req: Request, res: Response) => {
  const cultivationLogs = await CultivationLog.find({}).populate({
    path: 'activity',
    select: '_id name desctiption amount unit',
  });

  res.status(StatusCodes.OK).json({ cultivationLogs });
};

const createCultivationLog = async (req: Request, res: Response) => {
  const { farmProductId, activityId, notes } = req.body;
  const images = req.files as Express.Multer.File[];
  const imageUrls = images.map((image) => {
    return { path: image.path, filename: image.filename };
  });

  if (!farmProductId || !activityId) {
    await deleteImages(imageUrls);
    throw new CustomError.BadRequestError(
      'Please provide farm product id, activity id'
    );
  }

  const farmProduct = await FarmProduct.findOne({ _id: farmProductId });
  const activity = await Activity.findOne({ _id: activityId });

  if (!farmProduct || !activity) {
    await deleteImages(imageUrls);
    throw new CustomError.BadRequestError(
      'Farm product or activity does not exist'
    );
  }

  const cultivationLog = await CultivationLog.create({
    farm_product: farmProduct._id,
    activity: activity._id,
    notes,
    images: imageUrls,
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

const updateCultivationLog = async (req: Request, res: Response) => {};

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
    deleteImages(cultivationLog.images);
  }
  res.status(StatusCodes.OK).json({ msg: 'Success! Cultivation log removed.' });
};

export {
  getAllCultivationLogs,
  createCultivationLog,
  getCultivationLog,
  getCultivationLogsByFarmProduct,
  updateCultivationLog,
  deleteCultivationLog,
};
