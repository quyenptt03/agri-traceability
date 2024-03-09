import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import { Medicine, Pest, PestCategory } from '../models';
import { remove, upload } from './cloudinary';

const getAllMedicine = async (req: Request, res: Response) => {
  const medicines = await Medicine.find({});
  res.status(StatusCodes.OK).json({ medicines, count: medicines.length });
};

const createMedicine = async (req: Request, res: Response) => {
  const {
    name,
    description,
    ingredients,
    usage_instruction,
    toxicity,
    dosage,
    isolation,
    recommendation,
    certificate,
  } = req.body;
  if (
    !name ||
    !description ||
    !ingredients ||
    !usage_instruction ||
    !toxicity ||
    !dosage ||
    !isolation ||
    !recommendation ||
    !certificate
  ) {
    throw new CustomError.BadRequestError('Please provide all infomation');
  }

  const medicine = await Medicine.create(req.body);
  res.status(StatusCodes.CREATED).json({ medicine });
};

const getMedicine = async (req: Request, res: Response) => {
  const { id: medicineId } = req.params;
  const medicine = await Medicine.findOne({ _id: medicineId });

  if (!medicine) {
    throw new CustomError.NotFoundError(`No medicine with id ${medicineId}`);
  }

  res.status(StatusCodes.OK).json({ medicine });
};

const updateMedicine = async (req: Request, res: Response) => {
  const { id: medicineId } = req.params;
  const medicine = await Medicine.findOneAndUpdate(
    { _id: medicineId },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!medicine) {
    throw new CustomError.NotFoundError(`No medicine with id ${medicineId}`);
  }
  res.status(StatusCodes.OK).json({ medicine });
};

const deleteMedicine = async (req: Request, res: Response) => {
  const { id: medicineId } = req.params;
  const medicine = await Medicine.findOne({ _id: medicineId });
  if (!medicine) {
    throw new CustomError.NotFoundError(`No medicine with id ${medicineId}`);
  }
  await medicine.deleteOne();
  if (medicine.images.length !== 0) {
    remove(medicine.images);
  }
  res.status(StatusCodes.OK).json({ msg: 'Success! Medicine removed' });
};

const uploadImages = async (req: Request, res: Response) => {
  if (!req.files) {
    throw new CustomError.BadRequestError('No files uploaded');
  }
  const { id: medicineId } = req.params;
  const images = req.files as Express.Multer.File[];
  const imageUrls = await upload(images);

  const medicine = await Medicine.findOne({ _id: medicineId });
  if (!medicine) {
    remove(imageUrls);
    throw new CustomError.NotFoundError(`No medicine with id ${medicineId}`);
  }
  if (medicine.images.length !== 0) {
    remove(medicine.images);
  }

  medicine.images = imageUrls;
  medicine.save();

  res.status(StatusCodes.CREATED).json({ medicine });
};

export {
  createMedicine,
  deleteMedicine,
  getAllMedicine,
  getMedicine,
  updateMedicine,
  uploadImages,
};
