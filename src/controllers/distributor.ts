import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import { Distributor, ProductPatch, TraceabilityInfo } from '../models';
import { remove, upload } from './cloudinary';

const getAllDistributors = async (req: Request, res: Response) => {
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

  const distributors = await Distributor.find(queryObject)
    .skip(skip)
    .limit(limit)
    .sort(sortList);

  const totalCount: number = await Distributor.countDocuments(queryObject);
  const totalPages: number = Math.ceil(totalCount / limit);
  res
    .status(StatusCodes.OK)
    .json({ distributors, count: distributors.length, page, totalPages });
};

const createDistributor = async (req: Request, res: Response) => {
  const { product_patch, warehouse_name, warehouse_address, stores } = req.body;

  if (!product_patch) {
    throw new CustomError.BadRequestError('Please provide product patch');
  }

  const productPatch = await ProductPatch.findOne({ _id: product_patch });
  if (!productPatch) {
    throw new CustomError.BadRequestError('Product patch does not exists');
  }

  if (!warehouse_name || !warehouse_address || !stores) {
    throw new CustomError.BadRequestError(
      'Please provide warehouse name, address and stores to distribute'
    );
  }

  const distributor = await Distributor.create(req.body);
  const info = await TraceabilityInfo.findOne({ _id: productPatch.info });
  info.distributor = distributor._id;
  await info.save();

  res.status(StatusCodes.CREATED).json({ distributor });
};

const getDistributor = async (req: Request, res: Response) => {
  const { id: distributorId } = req.params;

  const distributor = await Distributor.findOne({ _id: distributorId });
  if (!distributor) {
    throw new CustomError.NotFoundError(
      `No distributor with id ${distributorId}`
    );
  }

  res.status(StatusCodes.OK).json({ distributor });
};

const updateDistributor = async (req: Request, res: Response) => {
  const { id: distributorId } = req.params;
  let productPatchExist;

  if (req.body.product_patch) {
    productPatchExist = await ProductPatch.findOne({
      _id: req.body.product_patch,
    });
    if (!productPatchExist) {
      throw new CustomError.BadRequestError(
        `No product patch with id ${req.body.product_patch}`
      );
    }
  }

  const distributor = await Distributor.findOneAndUpdate(
    { _id: distributorId },
    req.body,
    {
      runValidators: true,
      new: true,
    }
  );

  if (!distributor) {
    throw new CustomError.NotFoundError(
      `No distributor with id ${distributorId}`
    );
  }

  res.status(StatusCodes.OK).json({ distributor });
};

const deleteDistributor = async (req: Request, res: Response) => {
  const { id: distributorId } = req.params;

  const distributor = await Distributor.findOne({ _id: distributorId });
  if (!distributor) {
    throw new CustomError.NotFoundError(
      `No distributor with id ${distributorId}`
    );
  }

  distributor.deleteOne();
  if (distributor.images.length !== 0) {
    remove(distributor.images);
  }
  res.status(StatusCodes.OK).json({ msg: 'Success! Distributor removed.' });
};

const uploadImages = async (req: Request, res: Response) => {
  if (!req.files) {
    throw new CustomError.BadRequestError('No files uploaded');
  }
  const { id: distributorId } = req.params;
  const images = req.files as Express.Multer.File[];
  const imageUrls = await upload(images);

  const distributor = await Distributor.findOne({
    _id: distributorId,
  });
  if (!distributor) {
    remove(imageUrls);
    throw new CustomError.NotFoundError(
      `No distributor with id ${distributorId}`
    );
  }
  if (distributor.images.length !== 0) {
    remove(distributor.images);
  }

  distributor.images = imageUrls;
  distributor.save();

  res.status(StatusCodes.CREATED).json({ distributor });
};

export {
  createDistributor,
  deleteDistributor,
  getAllDistributors,
  getDistributor,
  updateDistributor,
  uploadImages,
};
