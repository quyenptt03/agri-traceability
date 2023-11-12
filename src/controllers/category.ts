import { Request, Response } from 'express';
import { Category } from '../models';
import { StatusCodes } from 'http-status-codes';
import { v2 as cloudinary } from 'cloudinary';
import slugify from 'slugify';
import CustomError from '../errors';
import { remove, upload } from './cloudinary';

const getAllCategories = async (req: Request, res: Response) => {
  const categories = await Category.find({});
  res.status(StatusCodes.OK).send({ categories, count: categories.length });
};

const createCategory = async (req: Request, res: Response) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new CustomError.BadRequestError(
      'Please provide name and description'
    );
  }

  const category = await Category.create({
    name,
    slug: slugify(name),
    description,
  });

  res.status(StatusCodes.CREATED).json({ category });
};

const getCategory = async (req: Request, res: Response) => {
  const { id: categoryId } = req.params;
  const category = await Category.findOne({ _id: categoryId });
  if (!category) {
    throw new CustomError.NotFoundError(`No category with id ${categoryId}`);
  }
  res.status(StatusCodes.OK).json({ category });
};

const updateCategory = async (req: Request, res: Response) => {
  const { id: categoryId } = req.params;
  const { name, description } = req.body;

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new CustomError.NotFoundError(`No category with id ${categoryId}`);
  }

  if (name) {
    category.name = name;
    category.slug = slugify(name);
  }

  if (description) {
    category.description = description;
  }

  await category.save();

  res.status(StatusCodes.OK).json({ category });
};

const deleteCategory = async (req: Request, res: Response) => {
  const { id: categoryId } = req.params;

  const category = await Category.findOne({ _id: categoryId });

  if (!category) {
    throw new CustomError.NotFoundError(`No category with id ${categoryId}`);
  }

  await category.deleteOne();
  if (category.images) {
    remove(category.images);
  }

  res.status(StatusCodes.OK).json({ msg: 'Success! Category removed.' });
};

const uploadImages = async (req: Request, res: Response) => {
  if (!req.files) {
    throw new CustomError.BadRequestError('No files uploaded');
  }

  const { id: categoryId } = req.params;
  const images = req.files as Express.Multer.File[];
  const imageUrls = upload(images);

  const category = await Category.findOne({ _id: categoryId });
  if (!category) {
    remove(imageUrls);
    throw new CustomError.NotFoundError(`No cateogry with id ${categoryId}`);
  }
  if (category.images.length !== 0) {
    remove(category.images);
  }

  category.images = imageUrls;
  await category.save();

  res.status(StatusCodes.CREATED).json({ category });
};

export {
  getAllCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  uploadImages,
};
