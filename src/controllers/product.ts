import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import { Product } from '../models';
import { remove, upload } from './cloudinary';

const getAllProduct = async (req: Request, res: Response) => {
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ products, count: products.length });
};

const createProduct = async (req: Request, res: Response) => {
  const {
    name,
    description,
    price,
    storage_method,
    production_date,
    expiration_date,
    notes,
  } = req.body;
  // @ts-ignore
  const user = req.user.userId;

  if (!name || !price || !description || !expiration_date || !storage_method) {
    throw new CustomError.BadRequestError(
      'Please provide name, price, description, expiration date, storage of product'
    );
  }

  const product = await Product.create(req.body);

  res.status(StatusCodes.CREATED).json({
    product,
  });
};

const getProduct = async (req: Request, res: Response) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({
    _id: productId,
  });

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req: Request, res: Response) => {
  const { id: productId } = req.params;

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
    throw new CustomError.NotFoundError(`No product with id ${productId}`);
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
