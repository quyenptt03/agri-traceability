import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import { Harvest, Processor } from '../models';
import { remove, upload } from './cloudinary';

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

  const processor = await Processor.find(queryObject)
    .skip(skip)
    .limit(limit)
    .sort(sortList)
    .populate({
      path: 'harvest',
    });

  const totalCount: number = await Harvest.countDocuments(queryObject);
  const totalPages: number = Math.ceil(totalCount / limit);

  res
    .status(StatusCodes.OK)
    .json({ processor, count: processor.length, page, totalPages });
};

const createProcessor = async (req: Request, res: Response) => {
  const { name, location, description, date } = req.body;
  if (!req.body.harvest) {
    throw new CustomError.BadRequestError("Please provide harvest's id");
  }

  const harvest = await Harvest.findOne({ _id: req.body.harvest });
  if (!harvest) {
    throw new CustomError.BadRequestError(
      `No harvest with id ${req.body.harvest}`
    );
  }

  if (!name || !location) {
    throw new CustomError.BadRequestError(
      'Please provide name and location of processor'
    );
  }

  const processor = await Processor.create({
    harvest: harvest._id,
    name,
    location,
    description,
    date,
  });

  res.status(StatusCodes.CREATED).json({ processor });
};

const getProcessor = async (req: Request, res: Response) => {
  const { id: processorId } = req.params;
  const processor = await Processor.findOne({ _id: processorId }).populate({
    path: 'harvest',
  });

  if (!processorId) {
    throw new CustomError.NotFoundError(`No processor with id ${processorId}`);
  }

  res.status(StatusCodes.OK).json({ processor });
};

const updateProcessor = async (req: Request, res: Response) => {
  const { id: processorId } = req.params;
  let harvestExist;

  if (req.body.harvest) {
    harvestExist = await Harvest.findOne({ _id: req.body.harvest });
    if (!harvestExist) {
      throw new CustomError.BadRequestError(
        `No harvest with id ${req.body.harvest}`
      );
    }
  }

  const processor = await Processor.findOneAndUpdate(
    { _id: processorId },
    req.body,
    {
      runValidators: true,
      new: true,
    }
  );

  if (!processor) {
    throw new CustomError.NotFoundError(`No processor with id ${processorId}`);
  }

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
  createProcessor,
  deleteProcessor,
  getAllProcessors,
  getProcessor,
  updateProcessor,
  uploadImages,
};
