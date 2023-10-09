import { Request, Response } from 'express';
import { Category } from '../models';
import { StatusCodes } from 'http-status-codes';
import { v2 as cloudinary } from 'cloudinary';
import slugify from 'slugify';
import CustomError from '../errors';

const getAllCategories = async (req: Request, res: Response) => {
  const categories = await Category.find({});
  res.status(StatusCodes.OK).send({ categories, count: categories.length });
};

const createCategory = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const image = req.file;

  if (!name || !description) {
    await cloudinary.uploader.destroy(image.filename);
    throw new CustomError.BadRequestError(
      'Please provide name and description'
    );
  }

  const isExist = await Category.findOne({ slug: slugify(name) });
  if (isExist) {
    await cloudinary.uploader.destroy(image.filename);
    throw new CustomError.BadRequestError('Category is exist');
  }
  const category = await Category.create({
    name,
    slug: slugify(name),
    description,
    image: image?.path,
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
  const image = req.file;

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new CustomError.NotFoundError(`No category with id ${categoryId}`);
  }

  if (name && name !== category.name) {
    const isExist = await Category.findOne({ slug: slugify(name) });

    if (isExist) {
      cloudinary.uploader.destroy(image.filename);
      throw new CustomError.BadRequestError('Category name already exists');
    }
  }

  if (name) {
    category.name = name;
    category.slug = slugify(name);
  }

  if (description) {
    category.description = description;
  }

  if (image) {
    if (category.image) {
      const pre_public_id = category.image
        .split('/')
        .slice(-2)
        .join('/')
        .split('.')[0];
      await cloudinary.uploader.destroy(pre_public_id);
    }

    category.image = image.path;
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
  if (category.image) {
    const pre_public_id = category.image
      .split('/')
      .slice(-2)
      .join('/')
      .split('.')[0];
    await cloudinary.uploader.destroy(pre_public_id);
  }

  res.status(StatusCodes.OK).json({ msg: 'Success! Category removed.' });
};

export {
  getAllCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
};
