import { Request, Response } from 'express';
import { FarmingArea } from '../models';
import { StatusCodes } from 'http-status-codes';
import { v2 as cloudinary } from 'cloudinary';
import CustomError from '../errors';

const getAllFarmingArea = async (req: Request, res: Response) => {
  const farmingAreas = await FarmingArea.find({});

  res.status(StatusCodes.OK).send({ farmingAreas, count: farmingAreas.length });
};

const createFarmingArea = async (req: Request, res: Response) => {
  const { name, description, area, address, coordinates } = req.body;
  const images = req.files as Express.Multer.File[];
  const imageUrls = images.map((image) => {
    return { path: image.path, filename: image.filename };
  });

  if (!name || !address) {
    const publicIds = imageUrls.map((imgUrl) => imgUrl.filename);
    await cloudinary.api.delete_resources(publicIds);
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
    images: imageUrls,
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
  const fileImages = req.files as Express.Multer.File[];

  const farmingArea = await FarmingArea.findOne({ _id: farmingAreaId });

  if (!farmingArea) {
    throw new CustomError.NotFoundError(
      `No farming area with id ${farmingAreaId}`
    );
  }

  if (name) {
    farmingArea.name = name;
  }
  if (description) {
    farmingArea.description = description;
  }
  if (area) {
    farmingArea.area = area;
  }
  if (address) {
    farmingArea.address = address;
  }
  if (coordinates) {
    farmingArea.coordinates = coordinates;
  }
  if (fileImages.length !== 0) {
    if (farmingArea.images.length !== 0) {
      const publicIds = farmingArea.images.map((img: any) => img.filename);
      await cloudinary.api.delete_resources(publicIds);
    }

    const imageUrls = fileImages.map((image) => {
      return { path: image.path, filename: image.filename };
    });
    farmingArea.images = imageUrls;
  }

  await farmingArea.save();

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
    const publicIds = farmingArea.images.map((img: any) => img.filename);
    await cloudinary.api.delete_resources(publicIds);
  }
  res.status(StatusCodes.OK).json({ msg: 'Success! Farming area removed' });
};

export {
  getAllFarmingArea,
  createFarmingArea,
  getFarmingArea,
  updateFarmingArea,
  deleteFarmingArea,
};
