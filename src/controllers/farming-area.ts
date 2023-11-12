import { Request, Response } from 'express';
import { FarmingArea } from '../models';
import { StatusCodes } from 'http-status-codes';
import { v2 as cloudinary } from 'cloudinary';
import CustomError from '../errors';
import { remove, upload } from './cloudinary';

const getAllFarmingArea = async (req: Request, res: Response) => {
  const farmingAreas = await FarmingArea.find({});

  res.status(StatusCodes.OK).send({ farmingAreas, count: farmingAreas.length });
};

const createFarmingArea = async (req: Request, res: Response) => {
  const { name, description, area, address, coordinates } = req.body;
  if (!name || !address) {
    throw new CustomError.BadRequestError(
      'Please provide name and address of farming area'
    );
  }

  const farmingArea = await FarmingArea.create({
    name,
    description,
    area,
    address,
    coordinates,
  });

  res.status(StatusCodes.CREATED).json({ farmingArea });
};

const getFarmingArea = async (req: Request, res: Response) => {
  const { id: farmingAreaId } = req.params;
  const farmingArea = await FarmingArea.findOne({ _id: farmingAreaId });

  if (!farmingArea) {
    throw new CustomError.NotFoundError(
      `No farming area with id ${farmingAreaId}`
    );
  }

  res.status(StatusCodes.OK).json({ farmingArea });
};

const updateFarmingArea = async (req: Request, res: Response) => {
  const { name, description, area, address, coordinates } = req.body;
  const { id: farmingAreaId } = req.params;

  const farmingArea = await FarmingArea.findOneAndUpdate(
    { _id: farmingAreaId },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!farmingArea) {
    throw new CustomError.NotFoundError(
      `No farming area with id ${farmingAreaId}`
    );
  }

  res.status(StatusCodes.OK).json({ farmingArea });
};

const deleteFarmingArea = async (req: Request, res: Response) => {
  const { id: farmingAreaId } = req.params;
  const farmingArea = await FarmingArea.findOne({ _id: farmingAreaId });
  if (!farmingArea) {
    throw new CustomError.NotFoundError(
      `No farming area with id ${farmingAreaId}`
    );
  }
  await farmingArea.deleteOne();
  if (farmingArea.images) {
    remove(farmingArea.images);
  }
  res.status(StatusCodes.OK).json({ msg: 'Success! Farming area removed' });
};

const uploadImages = async (req: Request, res: Response) => {
  if (!req.files) {
    throw new CustomError.BadRequestError('No file uploaded');
  }
  const { id: farmingAreaId } = req.params;
  const images = req.files as Express.Multer.File[];
  const imageUrls = upload(images);

  const farmingArea = await FarmingArea.findOne({ _id: farmingAreaId });
  if (!farmingArea) {
    remove(farmingArea.images);
    throw new CustomError.NotFoundError(
      `No farming area with id ${farmingAreaId}`
    );
  }
  if (farmingArea.images.length !== 0) {
    remove(farmingArea.images);
  }

  farmingArea.images = imageUrls;
  farmingArea.save();

  res.status(StatusCodes.CREATED).json({ farmingArea });
};

export {
  getAllFarmingArea,
  createFarmingArea,
  getFarmingArea,
  updateFarmingArea,
  deleteFarmingArea,
  uploadImages,
};
