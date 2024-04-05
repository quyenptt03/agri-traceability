import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import { Product } from '../models';
import { remove, upload } from './cloudinary';

const getAllProduct = async (req: Request, res: Response) => {
  const { searchQuery, sort } = req.query;
  const queryObject: any = {};
  let sortList;

  if (sort) {
    sortList = (sort as string).split(',').join(' ');
  }

  if (searchQuery) {
    queryObject.name = { $regex: searchQuery, $options: 'i' };
  }

  const page: number = Math.abs(Number(req.query.page)) || 1;
  const limit: number = Math.abs(Number(req.query.limit)) || 10;
  const skip: number = (page - 1) * limit;

  const products = await Product.find(queryObject)
    .skip(skip)
    .limit(limit)
    .sort(sortList);

  const totalCount: number = await Product.countDocuments(queryObject);
  const totalPages: number = Math.ceil(totalCount / limit);

  res
    .status(StatusCodes.OK)
    .json({ products, count: products.length, page, totalPages });
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
      'Please provide name, price, description, expiration date, storage method of product'
    );
  }

  const product = await Product.create({
    name,
    description,
    price,
    storage_method,
    production_date,
    expiration_date,
    notes,
  });

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
