import { Request, Response } from 'express';
import { PestCategory } from '../models';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';

const getAllPestCategories = async (req: Request, res: Response) => {
  const category = await PestCategory.find({});
  res
    .status(StatusCodes.OK)
    .send({ pestCategory: category, count: category.length });
};

const createPestCategory = async (req: Request, res: Response) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new CustomError.BadRequestError(
      'Please provide name and description'
    );
  }

  const category = await PestCategory.create({
    name,
    description,
  });

  res.status(StatusCodes.CREATED).json({ category });
};

const getPestCategory = async (req: Request, res: Response) => {
  const { id: pestCategoryId } = req.params;
  const category = await PestCategory.findOne({ _id: pestCategoryId });
  if (!category) {
    throw new CustomError.NotFoundError(
      `No pest category with id ${pestCategoryId}`
    );
  }
  res.status(StatusCodes.OK).json({ category });
};

const updatePestCategory = async (req: Request, res: Response) => {
  const { id: pestCategoryId } = req.params;
  const category = await PestCategory.findOneAndUpdate(
    { _id: pestCategoryId },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!category) {
    throw new CustomError.NotFoundError(
      `No pest category with id ${pestCategoryId}`
    );
  }
  res.status(StatusCodes.OK).json({ category });
};

const deletePestCategory = async (req: Request, res: Response) => {
  const { id: pestCategoryId } = req.params;
  const category = await PestCategory.findOne({ _id: pestCategoryId });
  if (!category) {
    throw new CustomError.NotFoundError(
      `No pest category with id ${pestCategoryId}`
    );
  }
  await category.deleteOne();
  res.status(StatusCodes.OK).json({ msg: 'Success! Pest category removed.' });
};

export {
  getAllPestCategories,
  createPestCategory,
  getPestCategory,
  updatePestCategory,
  deletePestCategory,
};
