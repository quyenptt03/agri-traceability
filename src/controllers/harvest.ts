import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import { Harvest, Herd } from '../models';
import { remove, upload } from './cloudinary';

const getAllHarvests = async (req: Request, res: Response) => {
  const { searchQuery, sort } = req.query;
  const queryObject: any = {};
  let sortList;

  if (sort) {
    sortList = (sort as string).split(',').join(' ');
  }

  if (searchQuery) {
    queryObject.name = { $regex: searchQuery, $options: 'i' };
  }

  const page: number = Math.abs(Number(req.query.page)) || 1;
  const limit: number = Math.abs(Number(req.query.limit)) || 10;
  const skip: number = (page - 1) * limit;

  const harvests = await Harvest.find(queryObject)
    .skip(skip)
    .limit(limit)
    .sort(sortList);

  const totalCount: number = await Harvest.countDocuments(queryObject);
  const totalPages: number = Math.ceil(totalCount / limit);
  res
    .status(StatusCodes.OK)
    .json({ harvests, count: harvests.length, page, totalPages });
};

const createHarvest = async (req: Request, res: Response) => {
  const { name, quantity, unit, date, description, grade } = req.body;
  if (!req.body.herd) {
    throw new CustomError.BadRequestError('Please provide herd id');
  }

  const herd = await Herd.findOne({ _id: req.body.herd });
  if (!herd) {
    throw new CustomError.BadRequestError('Herd does not exists');
  }

  const harvest = await Harvest.create({
    herd: herd._id,
    name,
    quantity,
    unit,
    date,
    description,
    grade,
  });

  res.status(StatusCodes.CREATED).json({ harvest });
};

const getHarvestsByHerd = async (req: Request, res: Response) => {
  const { id: herdId } = req.params;

  const herd = await Herd.findOne({ _id: herdId });
  if (!herd) {
    throw new CustomError.BadRequestError(`No herd with id ${herdId}`);
  }

  const harvests = await Harvest.find({ herd: herd._id }).populate({
    path: 'herd',
    select: '_id name',
  });

  res.status(StatusCodes.OK).json({ harvests, count: harvests.length });
};

const getHarvest = async (req: Request, res: Response) => {
  const { id: harvestId } = req.params;

  const harvest = await Harvest.findOne({ _id: harvestId });
  if (!harvest) {
    throw new CustomError.NotFoundError(`No harvest with id ${harvestId}`);
  }

  res.status(StatusCodes.OK).json({ harvest });
};

const updateHarvest = async (req: Request, res: Response) => {
  const { id: harvestId } = req.params;
  let herdExist;

  if (req.body.herd) {
    herdExist = await Herd.findOne({ _id: req.body.herd });
    if (!herdExist) {
      throw new CustomError.BadRequestError(`No herd with id ${req.body.herd}`);
    }
  }

  const harvest = await Harvest.findOneAndUpdate({ _id: harvestId }, req.body, {
    runValidators: true,
    new: true,
  });

  if (!harvest) {
    throw new CustomError.NotFoundError(`No harvest with id ${harvestId}`);
  }

  await harvest.populate({ path: 'herd', select: '_id name' });

  res.status(StatusCodes.OK).json({ harvest });
};

const deleteHarvest = async (req: Request, res: Response) => {
  const { id: harvestId } = req.params;

  const harvest = await Harvest.findOne({ _id: harvestId });
  if (!harvest) {
    throw new CustomError.NotFoundError(`No harvest with id ${harvestId}`);
  }

  harvest.deleteOne();
  if (harvest.images.length !== 0) {
    remove(harvest.images);
  }
  res.status(StatusCodes.OK).json({ msg: 'Success! Harvest removed.' });
};

const uploadImages = async (req: Request, res: Response) => {
  if (!req.files) {
    throw new CustomError.BadRequestError('No files uploaded');
  }
  const { id: harvestId } = req.params;
  const images = req.files as Express.Multer.File[];
  const imageUrls = await upload(images);

  const harvest = await Harvest.findOne({
    _id: harvestId,
  });
  if (!harvest) {
    remove(imageUrls);
    throw new CustomError.NotFoundError(`No harvest with id ${harvestId}`);
  }
  if (harvest.images.length !== 0) {
    remove(harvest.images);
  }

  harvest.images = imageUrls;
  harvest.save();

  res.status(StatusCodes.CREATED).json({ harvest });
};

export {
  getAllHarvests,
  createHarvest,
  getHarvest,
  getHarvestsByHerd,
  updateHarvest,
  deleteHarvest,
  uploadImages,
};
