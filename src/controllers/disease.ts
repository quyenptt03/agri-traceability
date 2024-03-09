import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import { Disease } from '../models';
import { remove, upload } from './cloudinary';

const getAllDiseases = async (req: Request, res: Response) => {
  const diseases = await Disease.find({});
  res.status(StatusCodes.OK).json({ diseases, count: diseases.length });
};

const createDisease = async (req: Request, res: Response) => {
  const disease = await Disease.create(req.body);
  res.status(StatusCodes.CREATED).json({ disease });
};

const getDisease = async (req: Request, res: Response) => {
  const { id: diseaseId } = req.params;
  const disease = await Disease.findOne({ _id: diseaseId });

  if (!disease) {
    throw new CustomError.NotFoundError(`No disease with id ${diseaseId}`);
  }

  res.status(StatusCodes.OK).json({ disease });
};

const updateDisease = async (req: Request, res: Response) => {
  const { id: diseaseId } = req.params;
  const disease = await Disease.findOneAndUpdate({ _id: diseaseId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!disease) {
    throw new CustomError.NotFoundError(`No disease with id ${diseaseId}`);
  }
  res.status(StatusCodes.OK).json({ disease });
};

const deleteDisease = async (req: Request, res: Response) => {
  const { id: diseaseId } = req.params;
  const disease = await Disease.findOne({ _id: diseaseId });
  if (!disease) {
    throw new CustomError.NotFoundError(`No disease with id ${diseaseId}`);
  }
  await disease.deleteOne();
  console.log(disease.images);
  if (disease.images.length !== 0) {
    remove(disease.images);
  }
  res.status(StatusCodes.OK).json({ msg: 'Success! Disease removed' });
};

const uploadImages = async (req: Request, res: Response) => {
  if (!req.files) {
    throw new CustomError.BadRequestError('No files uploaded');
  }
  const { id: diseaseId } = req.params;
  const images = req.files as Express.Multer.File[];
  const imageUrls = await upload(images);

  const disease = await Disease.findOne({ _id: diseaseId });
  if (!disease) {
    remove(imageUrls);
    throw new CustomError.NotFoundError(`No disease with id ${diseaseId}`);
  }
  if (disease.images.length !== 0) {
    remove(disease.images);
  }

  disease.images = imageUrls;
  disease.save();

  res.status(StatusCodes.CREATED).json({ disease });
};

export {
  createDisease,
  getAllDiseases,
  getDisease,
  updateDisease,
  deleteDisease,
  uploadImages,
};
