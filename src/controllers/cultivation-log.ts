import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import { Animal, CultivationLog, Herd } from '../models';
import { remove, upload } from './cloudinary';

const getAllCultivationLogs = async (req: Request, res: Response) => {
  const cultivationLogs = await CultivationLog.find({});
  res
    .status(StatusCodes.OK)
    .json({ cultivationLogs, count: cultivationLogs.length });
};

const createHerdCultivationLog = async (req: Request, res: Response) => {
  const { herd, name, description, notes, date } = req.body;

  if (!herd) {
    throw new CustomError.BadRequestError('Please provide herd id');
  }
  const herdExist = await Herd.findOne({ _id: herd });
  if (!herdExist) {
    throw new CustomError.BadRequestError('Herd does not exists');
  }

  const cultivationLog = await CultivationLog.create({
    name,
    description,
    notes,
    date,
    herd,
  });
  res.status(StatusCodes.CREATED).json({ cultivationLog });
};

// const createCultivationLog = async (req: Request, res: Response) => {
//   const { animalId, name, description, notes, date } = req.body;

//   if (!animalId) {
//     throw new CustomError.BadRequestError('Please provide animal id');
//   }
//   const animal = await Animal.findOne({ _id: animalId });
//   if (!animal) {
//     throw new CustomError.BadRequestError('Animal does not exists');
//   }

//   const cultivationLog = await CultivationLog.create({
//     name,
//     description,
//     notes,
//     date,
//     animal: animalId,
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

// const getCultivationLogsByAnimal = async (req: Request, res: Response) => {
//   const { id: animalId } = req.params;
//   const animal = await Animal.findOne({ _id: animalId });

//   if (!animal) {
//     throw new CustomError.BadRequestError(`No animal with id ${animalId}`);
//   }

//   const cultivationLogsByHerd = await CultivationLog.find({
//     herd: animal.herd,
//   });

//   const cultivationByAnimal = await CultivationLog.find({
//     animal: animal._id,
//   });

//   res.status(StatusCodes.OK).json({
//     ...cultivationLogsByHerd,
//     ...cultivationByAnimal,
//   });
// };

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
  const { herd } = req.body;

  if (herd) {
    const herdExist = await Herd.findOne({ _id: herd });
    if (!herdExist) {
      throw new CustomError.BadRequestError('The herd does not exists');
    }
  }

  const cultivationLog = await CultivationLog.findOneAndUpdate(
    { _id: cultivationLogId },
    req.body,
    {
      runValidators: true,
      new: true,
    }
  );

  if (!cultivationLog) {
    throw new CustomError.NotFoundError(
      `No cultivation log with id ${cultivationLogId}`
    );
  }

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
  if (cultivationLog.images.length !== 0) {
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
  // createCultivationLog,
  createHerdCultivationLog,
  getCultivationLog,
  // getCultivationLogsByAnimal,
  getCultivationLogsByHerd,
  updateHerdCultivationLog,
  deleteCultivationLog,
  uploadImages,
};
