import { Request, Response } from "express";
import Category from "../models/Category";
import { StatusCodes } from "http-status-codes";
import { v2 as cloudinary } from "cloudinary";
import slugify from "slugify";
import CustomError from "../errors";

const getAllCategories = async (req: Request, res: Response) => {
  const categories = await Category.find({});
  res.status(StatusCodes.OK).send({ categories, count: categories.length });
};

const createCategory = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const image = req.file;

  if (!name || !description) {
    cloudinary.uploader.destroy(image.filename);
    throw new CustomError.BadRequestError(
      "Please provide name and description"
    );
  }

  const isExist = await Category.findOne({ slug: slugify(name) });
  if (isExist) {
    cloudinary.uploader.destroy(image.filename);
    throw new CustomError.BadRequestError("Category is exist");
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
  // const { id: categoryId } = req.params;
  // const image = req.file;
  // let updateData = { ...req.body };
  // const category = await Category.findOne({ _id: categoryId });
  // if (!category) {
  //   throw new CustomError.NotFoundError(`No category with id ${categoryId}`);
  // }
  // const public_id = category.image.split("/").slice(-2).join("/").split(".")[0];

  // if (image) {
  //   cloudinary.uploader.destroy(public_id, function (error, result) {
  //     console.log(result, error);
  //   });
  //   updateData = { ...updateData, image: image.path };
  // }

  // const cat = await Category.findOneAndUpdate({ _id: categoryId }, updateData, {
  //   new: true,
  //   runValidators: true,
  // });

  // res.status(StatusCodes.OK).json({ cat });

  // const { id: categoryId } = req.params;
  // const image = req.file;
  // let updateData = { ...req.body };
  // const category = await Category.findOne({ _id: categoryId });
  // if (!category) {
  //   throw new CustomError.NotFoundError(`No category with id ${categoryId}`);
  // }
  // const public_id = category.image.split("/").slice(-2).join("/").split(".")[0];
  // if (updateData.name) {
  //   const category = await Category.findOne({ _id: categoryId });
  //   if (!category) {
  //     throw new CustomError.NotFoundError(`No category with id ${categoryId}`);
  //   }
  // }
  // const cat = await Category.findOneAndUpdate({ _id: categoryId }, updateData, {
  //   new: true,
  //   runValidators: true,
  // });
  // // if (cat.invalidate) {
  // //   cloudinary.uploader.destroy(image.filename);
  // // }
  // if (image) {
  //   cloudinary.uploader.destroy(public_id, function (error, result) {
  //     console.log(result, error);
  //   });
  // }

  const { _id: categoryId } = req.params;
  const isExistCat = await Category.findOne({ _id: categoryId });
  if (!isExistCat) {
    throw new CustomError.NotFoundError(`No category with id ${categoryId}`);
  }
};

export { getAllCategories, createCategory, getCategory, updateCategory };
