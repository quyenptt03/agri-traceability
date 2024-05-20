import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import {
  Harvest,
  Herd,
  Processor,
  ProductInfo,
  TraceabilityInfo,
} from '../models';
import { remove, upload } from './cloudinary';
import generateQR from '../utils/generateQR';

const getAllProcessors = async (req: Request, res: Response) => {
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

  const processors = await Processor.find(queryObject)
    .skip(skip)
    .limit(limit)
    .sort(sortList)
    .populate({
      path: 'harvest',
    });

  const totalCount: number = await Processor.countDocuments(queryObject);
  const totalPages: number = Math.ceil(totalCount / limit);

  res
    .status(StatusCodes.OK)
    .json({ processors, count: processors.length, page, totalPages });
};

const getAllProducts = async (req: Request, res: Response) => {
  const products = await Processor.find({})
    .populate('product_info')
    .select(
      'price currency_unit net_weight unit dte production_date images qr_code'
    );

  res.status(StatusCodes.OK).json({ products, count: products.length });
};

const createProcessor = async (req: Request, res: Response) => {
  const {
    price,
    currency_unit,
    net_weight,
    unit,
    dte,
    production_date,
    description,
    location,
    quantity,
  } = req.body;

  if (!req.body.harvest) {
    throw new CustomError.BadRequestError("Please provide harvest's id");
  }

  const harvest = await Harvest.findOne({ _id: req.body.harvest });
  if (!harvest) {
    throw new CustomError.BadRequestError(
      `No harvest with id ${req.body.harvest}`
    );
  }

  if (!req.body.product_info) {
    throw new CustomError.BadRequestError('Please provide product info');
  }

  const product_info = await ProductInfo.findOne({
    _id: req.body.product_info,
  });
  if (!product_info) {
    throw new CustomError.BadRequestError(
      `No product info with id ${req.body.product_info}`
    );
  }

  if (!price || !net_weight || !unit || !dte || !location || !quantity) {
    throw new CustomError.BadRequestError('Please provide all the infomation');
  }

  const processor = await Processor.create({
    harvest: harvest._id,
    product_info: product_info._id,
    price,
    currency_unit,
    net_weight,
    unit,
    dte,
    production_date,
    description,
    location,
    quantity,
  });

  harvest.isProcessed = true;
  await harvest.save();

  const herd = await Herd.findOne({ _id: harvest.herd });
  if (!herd) {
    throw new CustomError.BadRequestError(
      'The infomation of herd does not exists'
    );
  }

  const traceabilityInfo = await TraceabilityInfo.create({
    product: processor,
    herd: herd._id,
    harvest: harvest._id,
  });

  const qrcode = await generateQR(traceabilityInfo._id.valueOf().toString());
  processor.info = traceabilityInfo._id;
  processor.qr_code = qrcode;
  await processor.save();

  res.status(StatusCodes.CREATED).json({ processor });
};

const getProcessor = async (req: Request, res: Response) => {
  const { id: processorId } = req.params;
  const processor = await Processor.findOne({ _id: processorId })
    .populate({
      path: 'harvest',
    })
    .populate({
      path: 'product_info',
    });

  if (!processorId) {
    throw new CustomError.NotFoundError(`No processor with id ${processorId}`);
  }

  res.status(StatusCodes.OK).json({ processor });
};

const updateProcessor = async (req: Request, res: Response) => {
  const { id: processorId } = req.params;
  const {
    price,
    currency_unit,
    net_weight,
    unit,
    dte,
    production_date,
    description,
    location,
    quantity,
    harvest,
    product_info,
  } = req.body;

  const processor = await Processor.findOne({ _id: processorId });

  if (!processor) {
    throw new CustomError.NotFoundError(`No processor with id ${processor}`);
  }

  if (price) {
    processor.price = price;
  }

  if (currency_unit) {
    processor.currency_unit = currency_unit;
  }

  if (net_weight) {
    processor.net_weight = net_weight;
  }

  if (unit) {
    processor.unit = unit;
  }

  if (dte) {
    processor.dte = dte;
  }

  if (production_date) {
    processor.production_date = production_date;
  }

  if (description) {
    processor.description = description;
  }

  if (location) {
    processor.location = location;
  }

  if (quantity) {
    processor.quantity = quantity;
  }

  if (harvest && harvest !== processor.harvest.toString()) {
    const newHarvest = await Harvest.findOne({ _id: harvest });
    if (!newHarvest) {
      throw new CustomError.BadRequestError(`No harvest with id ${harvest}`);
    }
    const oldHarvest = await Harvest.findOne({ _id: processor.harvest });
    if (!newHarvest) {
      throw new CustomError.BadRequestError('Old harvest is not exists');
    }

    processor.harvest = newHarvest._id;

    oldHarvest.isProcessed = false;
    await oldHarvest.save();

    newHarvest.isProcessed = true;
    await newHarvest.save();
  }

  if (product_info && product_info !== processor.product_info.toString()) {
    const newProductInfo = await ProductInfo.findOne({ _id: harvest });
    if (!newProductInfo) {
      throw new CustomError.BadRequestError(
        `No product info with id ${product_info}`
      );
    }

    processor.product_info = newProductInfo._id;
  }

  await processor.save();
  res.status(StatusCodes.OK).json({ processor });
};

const deleteProcessor = async (req: Request, res: Response) => {
  const { id: processorId } = req.params;

  const processor = await Processor.findOne({ _id: processorId });
  if (!processor) {
    throw new CustomError.NotFoundError(`No processor with id ${processor}`);
  }

  processor.deleteOne();
  if (processor.images.length !== 0) {
    remove(processor.images);
  }
  res.status(StatusCodes.OK).json({ msg: 'Success! Processor removed.' });
};

const uploadImages = async (req: Request, res: Response) => {
  if (!req.files) {
    throw new CustomError.BadRequestError('No files uploaded');
  }
  const { id: processorId } = req.params;
  const images = req.files as Express.Multer.File[];
  const imageUrls = await upload(images);

  const processor = await Processor.findOne({
    _id: processorId,
  });
  if (!processor) {
    remove(imageUrls);
    throw new CustomError.NotFoundError(`No processor with id ${processorId}`);
  }
  if (processor.images.length !== 0) {
    remove(processor.images);
  }

  processor.images = imageUrls;
  processor.save();

  res.status(StatusCodes.CREATED).json({ processor });
};

export {
  getAllProducts,
  createProcessor,
  deleteProcessor,
  getAllProcessors,
  getProcessor,
  updateProcessor,
  uploadImages,
};
