import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Category, Herd, Farm, Animal } from '../models';
import CustomError from '../errors';
import generateQR from '../utils/generateQR';
import { remove, upload } from './cloudinary';

const getAllHerd = async (req: Request, res: Response) => {
  const herds = await Herd.find({})
    .populate({
      path: 'category',
      select: '_id name',
    })
    .populate({
      path: 'farm',
      select: '_id name',
    })
    .populate({
      path: 'records',
      select: 'name',
    });
  res.status(StatusCodes.OK).json({ herds, count: herds.length });
};

const createHerd = async (req: Request, res: Response) => {
  const {
    name,
    categoryId,
    description,
    location,
    farmId,
    start_date,
    end_date,
  } = req.body;

  if (!categoryId) {
    throw new CustomError.BadRequestError('Please provide category id');
  }
  const category = await Category.findOne({ _id: categoryId });
  if (!category) {
    throw new CustomError.BadRequestError('Category does not exists.');
  }
  const farm = await Farm.findOne({ _id: farmId });
  if (!farm) {
    throw new CustomError.BadRequestError('Farm does not exists.');
  }

  if (!name || !description || !location) {
    throw new CustomError.BadRequestError(
      'Please provide name, description, location of herd'
    );
  }

  const herd = await Herd.create({
    name,
    category: category.id,
    description,
    location,
    farm: farm._id,
    start_date,
    end_date,
  });

  res.status(StatusCodes.CREATED).json({ herd });
};

const generateHerdMember = async (req: Request, res: Response) => {
  const { id: herdId } = req.params;
  const herd = await Herd.findOne({ _id: herdId });
  if (!herd) {
    throw new CustomError.NotFoundError(`No herd with id ${herdId}`);
  }

  if (!req.body.quantity) {
    throw new CustomError.BadRequestError('Please provide the quantity');
  }

  const baseName = req.body.baseName ? req.body.baseName : herd.name;
  const animals = [];
  for (let i = 0; i < req.body.quantity; i++) {
    animals.push({
      name: `${baseName} ${i + 1}`,
      herd: herd._id,
      birth_date: req.body.birth_date,
    });
  }

  const createdAnimals = await Animal.insertMany(animals);
  res.status(StatusCodes.CREATED).json({ createdAnimals });
};

const getHerd = async (req: Request, res: Response) => {
  const { id: herdId } = req.params;
  const herd = await Herd.findOne({
    _id: herdId,
  })
    .populate({
      path: 'category',
      select: '_id name',
    })
    .populate({
      path: 'farm',
      select: '_id name',
    })
    .populate('records');

  if (!herd) {
    throw new CustomError.NotFoundError(`No herd with id ${herdId}`);
  }

  res.status(StatusCodes.OK).json({ herd });
};

const updateHerd = async (req: Request, res: Response) => {
  const { id: herdId } = req.params;
  const {
    name,
    category,
    description,
    member_count,
    farm,
    start_date,
    end_date,
  } = req.body;
  let categoryExist, farmExist;
  const herd = await Herd.findOne({ _id: herdId });
  if (!herd) {
    throw new CustomError.NotFoundError(`No herd with id ${herdId}`);
  }

  if (name) {
    herd.name = name;
  }
  if (description) {
    herd.description = description;
  }
  if (member_count) {
    herd.member_count = member_count;
  }
  if (start_date) {
    herd.start_date = start_date;
  }
  if (end_date) {
    herd.end_date = end_date;
  }
  if (category) {
    categoryExist = await Category.findOne({ _id: category });
    if (!category) {
      throw new CustomError.BadRequestError('Category does not exists.');
    }

    herd.category = category;
  }

  if (farm) {
    farmExist = await Farm.findOne({ _id: farm });
    if (!farmExist) {
      throw new CustomError.BadRequestError('Farm does not exists.');
    }

    herd.farm = farm;
  }
  await herd.save();

  res.status(StatusCodes.OK).json({ herd });
};

const deleteHerd = async (req: Request, res: Response) => {
  const { id: herdId } = req.params;
  const herd = await Herd.findOne({ _id: herdId });

  if (!herd) {
    throw new CustomError.NotFoundError(`No herd with id ${herdId}`);
  }

  await Animal.deleteMany({ herd: herd._id });

  await herd.deleteOne();
  if (herd.images.length !== 0) {
    remove(herd.images);
  }
  res
    .status(StatusCodes.OK)
    .json({ msg: 'Success! Herd and associated animals removed' });
};

const uploadImages = async (req: Request, res: Response) => {
  if (!req.files) {
    throw new CustomError.BadRequestError('No files uploaded');
  }
  const { id: herdId } = req.params;
  const images = req.files as Express.Multer.File[];
  const imageUrls = await upload(images);

  const herd = await Herd.findOne({ _id: herdId });
  if (!herd) {
    remove(imageUrls);
    throw new CustomError.NotFoundError(`No herd with id ${herdId}`);
  }
  if (herd.images.length !== 0) {
    remove(herd.images);
  }

  herd.images = imageUrls;
  herd.save();

  res.status(StatusCodes.CREATED).json({ herd });
};

const seperateHerd = async (req: Request, res: Response) => {
  const { id: herdId } = req.params;
  const herd = Herd.findOne({ _id: herdId });
};

export {
  getAllHerd,
  createHerd,
  generateHerdMember,
  getHerd,
  updateHerd,
  deleteHerd,
  uploadImages,
};
