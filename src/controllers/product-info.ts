import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import { ProductInfo } from '../models';

const getAllProductInfo = async (req: Request, res: Response) => {
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

  const products = await ProductInfo.find(queryObject)
    .skip(skip)
    .limit(limit)
    .sort(sortList);

  const totalCount: number = await ProductInfo.countDocuments(queryObject);
  const totalPages: number = Math.ceil(totalCount / limit);

  res
    .status(StatusCodes.OK)
    .json({ products, count: products.length, page, totalPages });
};

const createProductInfo = async (req: Request, res: Response) => {
  const { name, description, storage_method } = req.body;
  // @ts-ignore
  const user = req.user.userId;

  if (!name || !description || !storage_method) {
    throw new CustomError.BadRequestError(
      'Please provide name, description, storage method of product'
    );
  }

  const productInfo = await ProductInfo.create({
    name,
    description,
    storage_method,
  });

  res.status(StatusCodes.CREATED).json({
    productInfo,
  });
};

const getProductInfo = async (req: Request, res: Response) => {
  const { id: productInfoId } = req.params;
  const productInfo = await ProductInfo.findOne({
    _id: productInfoId,
  });

  if (!productInfo) {
    throw new CustomError.NotFoundError(
      `No product info with id ${productInfoId}`
    );
  }

  res.status(StatusCodes.OK).json({ productInfo });
};

const updateProductInfo = async (req: Request, res: Response) => {
  const { id: productInfoId } = req.params;

  const productInfo = await ProductInfo.findOneAndUpdate(
    { _id: productInfoId },
    req.body,
    {
      runValidators: true,
      new: true,
    }
  );
  if (!productInfo) {
    throw new CustomError.NotFoundError(
      `No product info with id ${productInfoId}`
    );
  }

  res.status(StatusCodes.OK).json({ productInfo });
};

const deleteProductInfo = async (req: Request, res: Response) => {
  const { id: productInfoId } = req.params;
  const productInfo = await ProductInfo.findOne({ _id: productInfoId });

  if (!productInfo) {
    throw new CustomError.NotFoundError(
      `No product info with id ${productInfoId}`
    );
  }

  await productInfo.deleteOne();

  res.status(StatusCodes.OK).json({ msg: 'Success! Product info removed' });
};

export {
  createProductInfo,
  getAllProductInfo,
  getProductInfo,
  updateProductInfo,
  deleteProductInfo,
};
