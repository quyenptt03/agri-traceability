import { Request, Response } from 'express';
import { Farm } from '../models';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import { remove, upload } from './cloudinary';

const getAllFarm = async (req: Request, res: Response) => {
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

  const farms = await Farm.find(queryObject)
    .skip(skip)
    .limit(limit)
    .sort(sortList);

  const totalCount: number = await Farm.countDocuments(queryObject);
  const totalPages: number = Math.ceil(totalCount / limit);

  res
    .status(StatusCodes.OK)
    .send({ farms, count: farms.length, page, totalPages });
};

const createFarm = async (req: Request, res: Response) => {
  const { name, description, area, address, coordinates } = req.body;
  if (!name || !address) {
    throw new CustomError.BadRequestError(
      'Please provide name and address of farm'
    );
  }

  const farm = await Farm.create({
    name,
    description,
    area,
    address,
    coordinates,
  });

  res.status(StatusCodes.CREATED).json({ farm });
};

const getFarm = async (req: Request, res: Response) => {
  const { id: farmId } = req.params;
  const farm = await Farm.findOne({ _id: farmId });

  if (!farm) {
    throw new CustomError.NotFoundError(`No farm with id ${farmId}`);
  }

  res.status(StatusCodes.OK).json({ farm });
};

const updateFarm = async (req: Request, res: Response) => {
  const { id: farmId } = req.params;

  const farm = await Farm.findOneAndUpdate({ _id: farmId }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!farm) {
    throw new CustomError.NotFoundError(`No farm with id ${farmId}`);
  }

  res.status(StatusCodes.OK).json({ farm });
};

const deleteFarm = async (req: Request, res: Response) => {
  const { id: farmId } = req.params;
  const farm = await Farm.findOne({ _id: farmId });
  if (!farm) {
    throw new CustomError.NotFoundError(`No farm with id ${farmId}`);
  }
  await farm.deleteOne();
  if (farm.images.length !== 0) {
    remove(farm.images);
  }
  res.status(StatusCodes.OK).json({ msg: 'Success! Farm removed' });
};

const uploadImages = async (req: Request, res: Response) => {
  if (!req.files) {
    throw new CustomError.BadRequestError('No files uploaded');
  }
  const { id: farmId } = req.params;
  const images = req.files as Express.Multer.File[];
  const imageUrls = upload(images);

  const farm = await Farm.findOne({ _id: farmId });
  if (!farm) {
    remove(farm.images);
    throw new CustomError.NotFoundError(`No farm with id ${farmId}`);
  }
  if (farm.images.length !== 0) {
    remove(farm.images);
  }

  farm.images = imageUrls;
  farm.save();

  res.status(StatusCodes.CREATED).json({ farm });
};

export {
  getAllFarm,
  createFarm,
  getFarm,
  updateFarm,
  deleteFarm,
  uploadImages,
};
