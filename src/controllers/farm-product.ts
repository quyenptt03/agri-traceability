import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Category, FarmProduct, FarmingArea } from '../models';
import { v2 as cloudinary } from 'cloudinary';
import CustomError from '../errors';
import generateQR from '../utils/generateQR';

const deleteImages = async (imageUrls: object[]) => {
  const publicIds = imageUrls.map((imgUrl: any) => imgUrl.filename);
  await cloudinary.api.delete_resources(publicIds);
};

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
  const images = req.files as Express.Multer.File[];
  const imageUrls = images.map((image) => {
    return { path: image.path, filename: image.filename };
  });

  if (!categoryId || !farmingAreaId) {
    await deleteImages(imageUrls);
    throw new CustomError.BadRequestError(
      'Please provide category and farming area'
    );
  }

  const category = await Category.findOne({ _id: categoryId });
  if (!category) {
    await deleteImages(imageUrls);
    throw new CustomError.BadRequestError('Category does not exists.');
  }
  const farmingArea = await FarmingArea.findOne({ _id: farmingAreaId });
  if (!farmingArea) {
    await deleteImages(imageUrls);
    throw new CustomError.BadRequestError('Farming area does not exists.');
  }

  if (!name || !description || !type) {
    await deleteImages(imageUrls);
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
    images: imageUrls,
  });

  const qrcode = await generateQR(category._id.valueOf().toString());
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
  const images = req.files as Express.Multer.File[];
  let imageUrls;
  let category, farmingArea;
  console.log(images);
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

  if (images.length !== 0) {
    imageUrls = images.map((image) => {
      return { path: image.path, filename: image.filename };
    });
    if (farmProduct.images.length !== 0) {
      deleteImages(farmProduct.images);
    }

    farmProduct.images = imageUrls;
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

  await FarmProduct.deleteOne();
  if (farmProduct.images) {
    deleteImages(farmProduct.images);
  }
  res.status(StatusCodes.OK).json({ msg: 'Success! Farm product remove' });
};

export {
  getAllFarmProduct,
  createFarmProduct,
  getFarmProduct,
  updateFarmProduct,
  deleteFarmProduct,
};
