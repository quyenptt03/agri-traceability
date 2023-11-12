import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import { Pest, PestCategory } from '../models';
import { remove, upload } from './cloudinary';

const getAllPests = async (req: Request, res: Response) => {
  const pests = await Pest.find({});
  res.status(StatusCodes.OK).json({ pests, count: pests.length });
};

const createPest = async (req: Request, res: Response) => {
  const { name, description, category_id } = req.body;
  if (!name || !description || !category_id) {
    throw new CustomError.BadRequestError('Please provide all infomation');
  }

  const category = await PestCategory.findById(category_id);
  if (!category) {
    throw new CustomError.BadRequestError('Pest category is not exist');
  }

  const pest = await Pest.create({
    name,
    description,
    category: category._id,
  });
  res.status(StatusCodes.CREATED).json({ pest });
};

const getPest = async (req: Request, res: Response) => {
  const { id: pestId } = req.params;
  const pest = await Pest.findOne({ _id: pestId }).populate({
    path: 'category',
    select: '_id name description',
  });

  if (!pest) {
    throw new CustomError.NotFoundError(`No pest with id ${pestId}`);
  }

  res.status(StatusCodes.OK).json({ pest });
};

const updatePest = async (req: Request, res: Response) => {
  const { id: pestId } = req.params;
  const pest = await Pest.findOneAndUpdate({ _id: pestId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!pest) {
    throw new CustomError.NotFoundError(`No pest with id ${pestId}`);
  }
  res.status(StatusCodes.OK).json({ pest });
};

const deletePest = async (req: Request, res: Response) => {
  const { id: pestId } = req.params;
  const pest = await Pest.findOne({ _id: pestId });
  if (!pest) {
    throw new CustomError.NotFoundError(`No pest with id ${pestId}`);
  }
  await pest.deleteOne();
  if (pest.images) {
    remove(pest.images);
  }
  res.status(StatusCodes.OK).json({ msg: 'Success! Pest removed' });
};

const uploadImages = async (req: Request, res: Response) => {
  if (!req.files) {
    throw new CustomError.BadRequestError('No file uploaded');
  }
  const { id: pestId } = req.params;
  const images = req.files as Express.Multer.File[];
  const imageUrls = await upload(images);

  const pest = await Pest.findOne({ _id: pestId });
  if (!pest) {
    remove(imageUrls);
    throw new CustomError.NotFoundError(`No pest with id ${pestId}`);
  }
  if (pest.images.length !== 0) {
    remove(pest.images);
  }

  pest.images = imageUrls;
  pest.save();

  res.status(StatusCodes.CREATED).json({ pest });
};

export {
  createPest,
  deletePest,
  getAllPests,
  getPest,
  updatePest,
  uploadImages,
};
