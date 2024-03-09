import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import { CultivationLog, Herd } from '../models';
import { remove, upload } from './cloudinary';

const getAllCultivationLogs = async (req: Request, res: Response) => {
  const cultivationLogs = await CultivationLog.find({});
  res
    .status(StatusCodes.OK)
    .json({ cultivationLogs, count: cultivationLogs.length });
};

const createHerdCultivationLog = async (req: Request, res: Response) => {
  const { herdId, name, description, notes, date } = req.body;

  if (!herdId) {
    throw new CustomError.BadRequestError('Please provide herd id');
  }
  const herd = await Herd.findOne({ _id: herdId });
  if (!herd) {
    throw new CustomError.BadRequestError('Herd does not exists');
  }

  const cultivationLog = await CultivationLog.create({
    name,
    description,
    notes,
    date,
    herd: herdId,
  });
  res.status(StatusCodes.CREATED).json({ cultivationLog });
};

// const createCultivationLog = async (req: Request, res: Response) => {
//   const { farmProductId, activityId, notes } = req.body;

//   if (!farmProductId || !activityId) {
//     throw new CustomError.BadRequestError(
//       'Please provide farm product id, activity id'
//     );
//   }

//   const farmProduct = await FarmProduct.findOne({ _id: farmProductId });
//   const activity = await Activity.findOne({ _id: activityId });

//   if (!farmProduct || !activity) {
//     throw new CustomError.BadRequestError(
//       'Farm product or activity does not exists'
//     );
//   }

//   const cultivationLog = await CultivationLog.create({
//     farm_product: farmProduct._id,
//     activity: activity._id,
//     notes,
//   });

//   res.status(StatusCodes.CREATED).json({ cultivationLog });
// };

const getCultivationLog = async (req: Request, res: Response) => {
  const { id: cultivationLogId } = req.params;
  const cultivationLog = await CultivationLog.findOne({
    _id: cultivationLogId,
  }).populate({
    path: 'herd',
    select: '_id name',
  });

  if (!cultivationLog) {
    throw new CustomError.NotFoundError(
      `No cultivation log with id ${cultivationLogId}`
    );
  }

  res.status(StatusCodes.OK).json({ cultivationLog });
};

const getCultivationLogsByHerd = async (req: Request, res: Response) => {
  const { id: herdId } = req.params;
  const herd = await Herd.findOne({ _id: herdId });

  if (!herd) {
    throw new CustomError.BadRequestError(`No herd with id ${herdId}`);
  }

  const cultivationLogs = await CultivationLog.find({
    herd: herdId,
  }).populate({
    path: 'herd',
    select: '_id name',
  });

  res
    .status(StatusCodes.OK)
    .json({ cultivationLogs, count: cultivationLogs.length });
};

const updateHerdCultivationLog = async (req: Request, res: Response) => {
  const { id: cultivationLogId } = req.params;
  const { herdId, name, description, notes, date } = req.body;

  const cultivationLog = await CultivationLog.findOne({
    _id: cultivationLogId,
  });

  if (!cultivationLog) {
    throw new CustomError.NotFoundError(
      `No cultivation log with id ${cultivationLogId}`
    );
  }

  if (name) {
    cultivationLog.name = name;
  }
  if (description) {
    cultivationLog.description = description;
  }
  if (notes) {
    cultivationLog.notes = notes;
  }
  if (date) {
    cultivationLog.date = date;
  }
  if (herdId) {
    const herd = await Herd.findOne({ _id: herdId });
    if (!herd) {
      throw new CustomError.BadRequestError('Herd does not exists.');
    }
    cultivationLog.herd = herd._id;
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
  createHerdCultivationLog,
  getCultivationLog,
  getCultivationLogsByHerd,
  updateHerdCultivationLog,
  deleteCultivationLog,
  uploadImages,
};
