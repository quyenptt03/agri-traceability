import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import { Herd, Product } from '../models';
import { remove, upload } from './cloudinary';

const getAllProduct = async (req: Request, res: Response) => {
  const products = await Product.find({}).populate({
    path: 'herd',
    select: '_id name',
  });
  res.status(StatusCodes.OK).json({ products, count: products.length });
};

const createProduct = async (req: Request, res: Response) => {
  const { name, description, herdId, productionDate, expirationDate, notes } =
    req.body;
  // @ts-ignore
  const user = req.user.userId;

  if (!herdId) {
    throw new CustomError.BadRequestError('Please provide herd id');
  }
  const herd = await Herd.findOne({ _id: herdId });
  if (!herd) {
    throw new CustomError.BadRequestError('Herd does not exists.');
  }

  if (!name || !description || !expirationDate) {
    throw new CustomError.BadRequestError(
      'Please provide name, description, expiration date of product'
    );
  }

  const product = await Product.create({
    name,
    herd: herd._id,
    description,
    production_date: productionDate,
    expiration_date: expirationDate,
    notes,
    user,
  });

  res.status(StatusCodes.CREATED).json({
    product,
  });
};

const getProduct = async (req: Request, res: Response) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({
    _id: productId,
  }).populate({
    path: 'herd',
    select: '_id name',
  });

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req: Request, res: Response) => {
  const { id: productId } = req.params;

  if (req.body.herdId) {
    const herdExist = await Herd.findOne({ _id: req.body.herdId });
    if (!herdExist) {
      throw new CustomError.BadRequestError('The herd does not exist');
    }
  }

  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    runValidators: true,
    new: true,
  });
  if (!product) {
    throw new CustomError.NotFoundError(`No product with id ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req: Request, res: Response) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id ${productId}`);
  }

  await product.deleteOne();
  if (product.images.length !== 0) {
    remove(product.images);
  }
  res.status(StatusCodes.OK).json({ msg: 'Success! Product remove' });
};

const uploadImages = async (req: Request, res: Response) => {
  if (!req.files) {
    throw new CustomError.BadRequestError('No files uploaded');
  }
  const { id: productId } = req.params;
  const images = req.files as Express.Multer.File[];
  const imageUrls = await upload(images);

  const product = await Product.findOne({ _id: productId });
  if (!product) {
    remove(imageUrls);
    throw new CustomError.NotFoundError(`No farm product with id ${productId}`);
  }
  if (product.images.length !== 0) {
    remove(product.images);
  }

  product.images = imageUrls;
  product.save();

  res.status(StatusCodes.CREATED).json({ product });
};

export {
  createProduct,
  deleteProduct,
  getAllProduct,
  getProduct,
  updateProduct,
  uploadImages,
};
