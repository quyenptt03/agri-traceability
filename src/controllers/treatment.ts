import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import { Disease, Herd, Treatment } from '../models';

const getAllTreatment = async (req: Request, res: Response) => {
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

  const treatments = await Treatment.find(queryObject)
    .skip(skip)
    .limit(limit)
    .sort(sortList)
    .populate({
      path: 'herd',
      select: '_id name',
    })
    .populate({
      path: 'disease',
      select: '_id name',
    });

  const totalCount: number = await Treatment.countDocuments(queryObject);
  const totalPages: number = Math.ceil(totalCount / limit);

  res
    .status(StatusCodes.OK)
    .json({ treatments, count: treatments.length, page, totalPages });
};

const createHerdTreatment = async (req: Request, res: Response) => {
  const {
    herd,
    disease,
    type,
    product,
    amount,
    mode,
    description,
    date,
    retreat_date,
    site,
    technician,
  } = req.body;
  let diseaseExist;

  if (!herd) {
    throw new CustomError.BadRequestError('Please provide herd');
  }

  const herdExist = await Herd.findOne({
    _id: herd,
  });

  if (!herdExist) {
    throw new CustomError.BadRequestError('Herd does not exist');
  }

  if (disease) {
    diseaseExist = await Disease.findOne({ _id: disease });
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
    herd,
    disease,
    type,
    product,
    amount,
    mode,
    description,
    date,
    retreat_date,
    site,
    technician,
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
  let diseaseExist;
  if (req.body.disease) {
    diseaseExist = await Disease.findOne({ _id: req.body.disease });

    if (!diseaseExist) {
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
  deleteTreatment,
  getAllTreatment,
  getTreatment,
  getTreatmentByHerd,
  updateTreatment,
};
