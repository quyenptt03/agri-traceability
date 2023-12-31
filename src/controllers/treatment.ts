import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import { Disease, FarmProduct, Medicine, Pest, Treatment } from '../models';

const getAllTreatment = async (req: Request, res: Response) => {
  const treatments = await Treatment.find({})
    .populate({
      path: 'farm_product',
      select: '_id name description',
    })
    .populate({
      path: 'medicine',
      select: '_id name',
    });
  res.status(StatusCodes.OK).json({ treatments, count: treatments.length });
};

const createTreatment = async (req: Request, res: Response) => {
  const {
    name,
    description,
    method,
    farmProductId,
    diseaseId,
    pestId,
    medicineId,
  } = req.body;

  if (!farmProductId) {
    throw new CustomError.BadRequestError('Please provide farm product ');
  }
  const farmProduct = await FarmProduct.findOne({
    _id: farmProductId,
  });
  if (!farmProduct) {
    throw new CustomError.BadRequestError('Farm product does not exist');
  }

  if (!medicineId) {
    throw new CustomError.BadRequestError(
      'Please provide pesticide/veterinary medicine '
    );
  }
  const medicine = await Medicine.findOne({ _id: medicineId });
  if (!medicine) {
    throw new CustomError.BadRequestError(
      'Pesticide/Veterinary medicine is not exist'
    );
  }

  if (!pestId && !diseaseId) {
    throw new CustomError.BadRequestError('Please provide pest/disease');
  }
  if (pestId) {
    const pest = await Pest.findOne({ _id: pestId });
    if (!pest) {
      throw new CustomError.BadRequestError('Pest does not exists');
    }
  }

  if (diseaseId) {
    const disease = await Disease.findOne({ _id: diseaseId });
    if (!disease) {
      throw new CustomError.BadRequestError('Disease doese not exists');
    }
  }
  const diseasePestId = pestId ? pestId : diseaseId;

  if (!description || !method) {
    throw new CustomError.BadRequestError(
      'Please provide all the necessary information'
    );
  }
  const treatment = await Treatment.create({
    name,
    description,
    method,
    farm_product: farmProduct._id,
    disease_pest: diseasePestId,
    medicine: medicine._id,
  });

  res.status(StatusCodes.CREATED).json({ treatment });
};

const getTreatment = async (req: Request, res: Response) => {
  const { id: treatmentId } = req.params;
  const treatment = await Treatment.findOne({ _id: treatmentId })
    .populate({
      path: 'farm_product',
      select: '_id name description',
    })
    .populate({
      path: 'medicine',
      select: '_id name',
    });

  if (!treatment) {
    throw new CustomError.NotFoundError(`No treatment with id ${treatmentId}`);
  }
  res.status(StatusCodes.OK).json({ treatment });
};

const updateTreatment = async (req: Request, res: Response) => {};

const deleteTreatment = async (req: Request, res: Response) => {
  const { id: treatmentId } = req.params;
  const treatment = await Treatment.findOne({ _id: treatmentId });
  if (!treatment) {
    throw new CustomError.NotFoundError(`No treatment with id ${treatmentId}`);
  }
  await treatment.deleteOne();
  res.status(StatusCodes.OK).json({ msg: 'Success! treatment removed' });
};

export {
  createTreatment,
  deleteTreatment,
  getAllTreatment,
  getTreatment,
  updateTreatment,
};
