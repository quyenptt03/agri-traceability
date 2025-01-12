import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import { Animal, CultivationLog, Herd } from '../models';
import { remove, upload } from './cloudinary';

const getAllCultivationLogs = async (req: Request, res: Response) => {
  const { searchQuery, sort } = req.query;
  const queryObject: any = {};
  let sortList;

  if (sort) {
    sortList = (sort as string).split(',').join(' ');
  }

  if (searchQuery) {
    queryObject.name = { $regex: searchQuery, $options: 'i' };
  }

  const page = Math.abs(Number(req.query.page)) || 1;
  const limit = Math.abs(Number(req.query.limit)) || 10;
  const skip = (page - 1) * limit;

  const cultivationLogs = await CultivationLog.find(queryObject)
    .skip(skip)
    .limit(limit)
    .sort(sortList);

  const totalCount: number = await CultivationLog.countDocuments(queryObject);
  const totalPages: number = Math.ceil(totalCount / limit);
  res
    .status(StatusCodes.OK)
    .json({ cultivationLogs, count: cultivationLogs.length, page, totalPages });
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

  const { searchQuery, sort } = req.query;
  const queryObject: any = {};
  let sortList;

  if (sort) {
    sortList = (sort as string).split(',').join(' ');
  }

  if (searchQuery) {
    queryObject.name = { $regex: searchQuery, $options: 'i' };
  }

  const page = Math.abs(Number(req.query.page)) || 1;
  const limit = Math.abs(Number(req.query.limit)) || 10;
  const skip = (page - 1) * limit;

  const cultivationLogs = await CultivationLog.find({
    herd: herdId,
    ...queryObject,
  })
    .skip(skip)
    .limit(limit)
    .sort(sortList)
    .populate({
      path: 'herd',
      select: '_id name',
    });

  const totalCount: number = await CultivationLog.countDocuments({
    herd: herdId,
    ...queryObject,
  });
  const totalPages: number = Math.ceil(totalCount / limit);

  res
    .status(StatusCodes.OK)
    .json({ cultivationLogs, count: cultivationLogs.length, page, totalPages });
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
  if (cultivationLog.mediaUri.length !== 0) {
    remove(cultivationLog.mediaUri);
  }
  res.status(StatusCodes.OK).json({ msg: 'Success! Cultivation log removed.' });
};

const uploadMediaUri = async (req: Request, res: Response) => {
  if (!req.files) {
    throw new CustomError.BadRequestError('No files uploaded');
  }
  const { id: cultivationLogId } = req.params;
  const mediaUri = req.files as Express.Multer.File[];
  const imageUrls = await upload(mediaUri);

  const cultivationLog = await CultivationLog.findOne({
    _id: cultivationLogId,
  });
  if (!cultivationLog) {
    remove(imageUrls);
    throw new CustomError.NotFoundError(
      `No cultivation log with id ${cultivationLogId}`
    );
  }
  if (cultivationLog.mediaUri.length !== 0) {
    remove(cultivationLog.mediaUri);
  }

  cultivationLog.mediaUri = imageUrls;
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
  uploadMediaUri,
};
