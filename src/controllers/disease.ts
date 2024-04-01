import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import { Disease } from '../models';
import { remove, upload } from './cloudinary';

const getAllDiseases = async (req: Request, res: Response) => {
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

  const diseases = await Disease.find(queryObject)
    .skip(skip)
    .limit(limit)
    .sort(sortList);

  const totalCount: number = await Disease.countDocuments(queryObject);
  const totalPages: number = Math.ceil(totalCount / limit);

  res
    .status(StatusCodes.OK)
    .json({ diseases, count: diseases.length, page, totalPages });
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
