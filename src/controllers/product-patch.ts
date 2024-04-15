import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import {
  Harvest,
  Herd,
  Processor,
  Product,
  TraceabilityInfo,
  ProductPatch,
} from '../models';
import { remove, upload } from './cloudinary';
import generateQR from '../utils/generateQR';

const getAllProductPatchs = async (req: Request, res: Response) => {
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

  const productPatchs = await ProductPatch.find(queryObject)
    .skip(skip)
    .limit(limit)
    .sort(sortList)
    .populate({
      path: 'product',
      select:
        '_id name description price production_date expiration_date storage_method qrcode',
    })
    .populate({ path: 'processor', select: '_id name location date images' });

  const totalCount: number = await ProductPatch.countDocuments(queryObject);
  const totalPages: number = Math.ceil(totalCount / limit);
  res
    .status(StatusCodes.OK)
    .json({ productPatchs, count: productPatchs.length, page, totalPages });
};

const createProductPatch = async (req: Request, res: Response) => {
  const {
    processor,
    product,
    quantity,
    description,
    production_date,
    release_date,
  } = req.body;

  if (!processor) {
    throw new CustomError.BadRequestError('Please provide processor');
  }

  const processorExist = await Processor.findOne({ _id: processor });
  if (!processorExist) {
    throw new CustomError.BadRequestError('Processor does not exists');
  }

  if (!product) {
    throw new CustomError.BadRequestError('Please provide product');
  }

  const productExist = await Product.findOne({ _id: product });
  if (!productExist) {
    throw new CustomError.BadRequestError('Product does not exist');
  }
  if (productExist.qrcode) {
    throw new CustomError.BadRequestError('Product already used.');
  }

  if (!quantity || !release_date) {
    throw new CustomError.BadRequestError(
      'Please provide qty and release date of the product patch'
    );
  }

  const productPatch = await ProductPatch.create({
    processor,
    product,
    quantity,
    description,
    production_date,
    release_date,
  });

  const harvest = await Harvest.findOne({ _id: processorExist.harvest });
  if (!harvest) {
    throw new CustomError.BadRequestError(
      'Harvest of processor does not exists'
    );
  }

  const herd = await Herd.findOne({ _id: harvest.herd });
  if (!herd) {
    throw new CustomError.BadRequestError(
      'The infomation of herd does not exists'
    );
  }

  const traceabilityInfo = await TraceabilityInfo.create({
    product,
    herd: herd._id,
    harvest: harvest._id,
    processor,
  });
  const qrcode = await generateQR(traceabilityInfo._id.valueOf().toString());
  productPatch.info = traceabilityInfo._id;
  await productPatch.save();
  productExist.qrcode = qrcode;
  await productExist.save();

  res.status(StatusCodes.CREATED).json({ productPatch });
};

const getProductPatch = async (req: Request, res: Response) => {
  const { id: productPatchId } = req.params;

  const productPatch = await ProductPatch.findOne({ _id: productPatchId })
    .populate({
      path: 'product',
      select:
        '_id name description price production_date expiration_date storage_method qrcode',
    })
    .populate({ path: 'processor', select: '_id name location date images' });
  if (!productPatch) {
    throw new CustomError.NotFoundError(
      `No product patch with id ${productPatchId}`
    );
  }

  res.status(StatusCodes.OK).json({ productPatch });
};

const updateProductPatch = async (req: Request, res: Response) => {
  const { id: productPatchId } = req.params;
  const {
    processor,
    product,
    quantity,
    description,
    production_date,
    release_date,
  } = req.body;

  const productPatch = await ProductPatch.findOne({ _id: productPatchId });

  if (!productPatch) {
    throw new CustomError.NotFoundError(
      `No product patch with id ${productPatchId}`
    );
  }

  if (quantity) {
    productPatch.quantity = quantity;
  }

  if (description) {
    productPatch.description = description;
  }

  if (production_date) {
    productPatch.production_date = production_date;
  }

  if (release_date) {
    productPatch.release_date = release_date;
  }

  if (processor !== productPatch.processor.toString()) {
    const newProcessor = await Processor.findOne({ _id: processor });
    if (!newProcessor) {
      throw new CustomError.BadRequestError('Processor does not exists');
    }
  }

  res.status(StatusCodes.OK).json({ productPatch });
};

const deleteProductPatch = async (req: Request, res: Response) => {
  const { id: productPatchId } = req.params;

  const productPatch = await ProductPatch.findOne({ _id: productPatchId });
  if (!productPatch) {
    throw new CustomError.NotFoundError(
      `No productPatch with id ${productPatchId}`
    );
  }

  productPatch.deleteOne();
  if (productPatch.images.length !== 0) {
    remove(productPatch.images);
  }
  res.status(StatusCodes.OK).json({ msg: 'Success! Product patch removed.' });
};

const uploadImages = async (req: Request, res: Response) => {
  if (!req.files) {
    throw new CustomError.BadRequestError('No files uploaded');
  }
  const { id: productPatchId } = req.params;
  const images = req.files as Express.Multer.File[];
  const imageUrls = await upload(images);

  const productPatch = await ProductPatch.findOne({
    _id: productPatchId,
  });
  if (!productPatch) {
    remove(imageUrls);
    throw new CustomError.NotFoundError(
      `No productPatch with id ${productPatchId}`
    );
  }
  if (productPatch.images.length !== 0) {
    remove(productPatch.images);
  }

  productPatch.images = imageUrls;
  productPatch.save();

  res.status(StatusCodes.CREATED).json({ productPatch });
};

export {
  getAllProductPatchs,
  createProductPatch,
  getProductPatch,
  updateProductPatch,
  deleteProductPatch,
  uploadImages,
};
