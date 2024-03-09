import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import { Disease, Herd, Medicine, Pest, Treatment } from '../models';

const getAllTreatment = async (req: Request, res: Response) => {
  const treatments = await Treatment.find({})
    .populate({
      path: 'herd',
      select: '_id name',
    })
    .populate({
      path: 'disease',
      select: '_id name',
    });
  res.status(StatusCodes.OK).json({ treatments, count: treatments.length });
};

// livestock: Types.ObjectId;
//   herd: Types.ObjectId;
//   disease: Types.ObjectId;
//   type: string;
//   product: String;
//   amount: String;
//   mode: string;
//   description: string;
//   method: string;
//   date: Date;
//   retreat_date: Date;
//   site: String;
//   technician: String;

const createHerdTreatment = async (req: Request, res: Response) => {
  const { herdId, diseaseId, type } = req.body;
  let disease;

  if (!herdId) {
    throw new CustomError.BadRequestError('Please provide herd');
  }

  const herd = await Herd.findOne({
    _id: herdId,
  });

  if (!herd) {
    throw new CustomError.BadRequestError('Herd does not exist');
  }

  if (diseaseId) {
    disease = await Disease.findOne({ _id: diseaseId });
    if (!disease) {
      throw new CustomError.BadRequestError('Disease doese not exists');
    }
  }

  if (!type) {
    throw new CustomError.BadRequestError(
      'Please provide all the type of treatment'
    );
  }
  const treatment = await Treatment.create({
    ...req.body,
    herd: herd._id,
    disease: diseaseId,
  });

  res.status(StatusCodes.CREATED).json({ treatment });
};

const getTreatmentByHerd = async (req: Request, res: Response) => {
  const { id: herdId } = req.params;
  const herd = await Herd.findOne({ _id: herdId });

  if (!herd) {
    throw new CustomError.BadRequestError(`No herd with id ${herdId}`);
  }

  const treatments = await Treatment.find({ herd: herd._id });
  res.status(StatusCodes.OK).json({ treatments, count: treatments.length });
};

const getTreatment = async (req: Request, res: Response) => {
  const { id: treatmentId } = req.params;
  const treatment = await Treatment.findOne({ _id: treatmentId })
    .populate({
      path: 'herd',
      select: '_id name',
    })
    .populate({
      path: 'disease',
      select: '_id name',
    });

  if (!treatment) {
    throw new CustomError.NotFoundError(`No treatment with id ${treatmentId}`);
  }
  res.status(StatusCodes.OK).json({ treatment });
};

const updateTreatment = async (req: Request, res: Response) => {
  const { id: treatmentId } = req.params;
  let disease;
  if (req.body.diseaseId) {
    disease = await Disease.findOne({ _id: req.body.diseaseId });

    if (!disease) {
      throw new CustomError.BadRequestError(`The disease does not exists`);
    }
  }

  const treatment = await Treatment.findOneAndUpdate(
    { _id: treatmentId },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!treatment) {
    throw new CustomError.NotFoundError(`No treatment with id ${treatmentId}`);
  }

  res.status(StatusCodes.OK).json({ treatment });
};

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
  createHerdTreatment,
  getAllTreatment,
  getTreatmentByHerd,
  getTreatment,
  updateTreatment,
  deleteTreatment,
};
