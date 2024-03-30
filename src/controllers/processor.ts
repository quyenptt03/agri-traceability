import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import { Harvest, Herd, Processor } from '../models';
import { remove, upload } from './cloudinary';

const getAllProcessors = async (req: Request, res: Response) => {
  const processor = await Processor.find({}).populate({
    path: 'harvest',
  });
  res.status(StatusCodes.OK).json({ processor, count: processor.length });
};

const createProcessor = async (req: Request, res: Response) => {
  if (!req.body.harvest) {
    throw new CustomError.BadRequestError("Please provide harvest's id");
  }

  const harvest = await Harvest.findOne({ _id: req.body.harvest });
  if (!harvest) {
    throw new CustomError.BadRequestError(
      `No harvest with id ${req.body.harvest}`
    );
  }

  if (!req.body.name || !req.body.location) {
    throw new CustomError.BadRequestError(
      'Please provide name and location of processor'
    );
  }

  const processor = await Processor.create(req.body);

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
  getAllProcessors,
  createProcessor,
  getProcessor,
  updateProcessor,
  deleteProcessor,
  uploadImages,
};
