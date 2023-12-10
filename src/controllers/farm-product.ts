import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Category, FarmProduct, FarmingArea } from '../models';
import { v2 as cloudinary } from 'cloudinary';
import CustomError from '../errors';
import generateQR from '../utils/generateQR';
import { remove, upload } from './cloudinary';

const getAllFarmProduct = async (req: Request, res: Response) => {
  const farmProducts = await FarmProduct.find({});
  res.status(StatusCodes.OK).json({ farmProducts, count: farmProducts.length });
};

const createFarmProduct = async (req: Request, res: Response) => {
  const {
    name,
    description,
    origin,
    cultivation_time,
    type,
    categoryId,
    farmingAreaId,
  } = req.body;

  if (!categoryId || !farmingAreaId) {
    throw new CustomError.BadRequestError(
      'Please provide category and farming area'
    );
  }

  const category = await Category.findOne({ _id: categoryId });
  if (!category) {
    throw new CustomError.BadRequestError('Category does not exists.');
  }
  const farmingArea = await FarmingArea.findOne({ _id: farmingAreaId });
  if (!farmingArea) {
    throw new CustomError.BadRequestError('Farming area does not exists.');
  }

  if (!name || !description || !type) {
    throw new CustomError.BadRequestError(
      'Please provide name, description, type of farm product'
    );
  }

  const farmProduct = await FarmProduct.create({
    name,
    description,
    origin,
    cultivation_time,
    type,
    category: category._id,
    farming_area: farmingArea._id,
  });

  const qrcode = await generateQR(farmProduct._id.valueOf().toString());
  farmProduct.qrcode = qrcode;
  await farmProduct.save();
  res.status(StatusCodes.CREATED).json({
    farmProduct,
  });
};

const getFarmProduct = async (req: Request, res: Response) => {
  const { id: farmProductId } = req.params;
  const farmProduct = await FarmProduct.findOne({ _id: farmProductId });

  if (!farmProduct) {
    throw new CustomError.NotFoundError(
      `No farm product with id ${farmProductId}`
    );
  }

  res.status(StatusCodes.OK).json({ farmProduct });
};

const updateFarmProduct = async (req: Request, res: Response) => {
  const { id: farmProductId } = req.params;
  const {
    name,
    description,
    origin,
    cultivation_time,
    type,
    categoryId,
    farmingAreaId,
  } = req.body;
  let category, farmingArea;
  const farmProduct = await FarmProduct.findOne({ _id: farmProductId });
  if (!farmProduct) {
    throw new CustomError.NotFoundError(
      `No farm product with id ${farmProductId}`
    );
  }

  if (name) {
    farmProduct.name = name;
  }
  if (description) {
    farmProduct.description = description;
  }
  if (origin) {
    farmProduct.origin = origin;
  }
  if (cultivation_time) {
    farmProduct.cultivation_time = cultivation_time;
  }
  if (type) {
    farmProduct.type = type;
  }
  if (categoryId) {
    category = await Category.findOne({ _id: categoryId });
    if (!category) {
      throw new CustomError.BadRequestError('Category does not exists.');
    }

    farmProduct.category = category._id;
  }

  if (farmingAreaId) {
    farmingArea = await FarmingArea.findOne({ _id: farmingAreaId });
    if (!farmingArea) {
      throw new CustomError.BadRequestError('Farming area does not exists.');
    }

    farmProduct.farming_area = farmingArea._id;
  }
  await farmProduct.save();

  res.status(StatusCodes.OK).json({ farmProduct });
};

const deleteFarmProduct = async (req: Request, res: Response) => {
  const { id: farmProductId } = req.params;
  const farmProduct = await FarmProduct.findOne({ _id: farmProductId });

  if (!farmProduct) {
    throw new CustomError.NotFoundError(
      `No farm product with id ${farmProductId}`
    );
  }

  await farmProduct.deleteOne();
  if (farmProduct.images) {
    remove(farmProduct.images);
  }
  res.status(StatusCodes.OK).json({ msg: 'Success! Farm product remove' });
};

const uploadImages = async (req: Request, res: Response) => {
  if (!req.files) {
    throw new CustomError.BadRequestError('No files uploaded');
  }
  const { id: farmProductId } = req.params;
  const images = req.files as Express.Multer.File[];
  const imageUrls = await upload(images);

  const farmProduct = await FarmProduct.findOne({ _id: farmProductId });
  if (!farmProduct) {
    remove(imageUrls);
    throw new CustomError.NotFoundError(
      `No farm product with id ${farmProductId}`
    );
  }
  if (farmProduct.images.length !== 0) {
    remove(farmProduct.images);
  }

  farmProduct.images = imageUrls;
  farmProduct.save();

  res.status(StatusCodes.CREATED).json({ farmProduct });
};

export {
  getAllFarmProduct,
  createFarmProduct,
  getFarmProduct,
  updateFarmProduct,
  deleteFarmProduct,
  uploadImages,
};
