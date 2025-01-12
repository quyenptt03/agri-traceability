import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Farm, Shelter } from '../models';
import CustomError from '../errors';

const getAllShelters = async (req: Request, res: Response) => {
  const shelters = await Shelter.find({});
  res.status(StatusCodes.OK).json({ shelters, count: shelters.length });
};

const createShelter = async (req: Request, res: Response) => {
  const { farm, cameraId } = req.body;

  const farmExist = await Farm.findOne({ _id: farm });
  if (!farmExist) {
    throw new CustomError.BadRequestError('Farm does not exists.');
  }

  const shelter = await Shelter.create({
    farm,
    cameraId,
  });

  res.status(StatusCodes.CREATED).json({ shelter });
};

const getShelter = async (req: Request, res: Response) => {
  const { id: shelterId } = req.params;
  const shelter = await Shelter.findOne({
    _id: shelterId,
  });

  if (!shelter) {
    throw new CustomError.NotFoundError(`No shelter with id ${shelterId}`);
  }

  res.status(StatusCodes.OK).json({ shelter });
};

const updateShelter = async (req: Request, res: Response) => {
  const { id: shelterId } = req.params;
  let farmExist;

  if (req.body.herd) {
    farmExist = await Farm.findOne({ _id: req.body.farm });
    if (!farmExist) {
      throw new CustomError.BadRequestError('Farm does not exists.');
    }
  }

  const shelter = await Shelter.findOneAndUpdate({ _id: shelterId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!shelter) {
    throw new CustomError.NotFoundError(`No shelter with id ${shelterId}`);
  }

  res.status(StatusCodes.OK).json({ shelter });
};

const deleteShelter = async (req: Request, res: Response) => {
  const { id: shelterId } = req.params;
  const shelter = await Shelter.findOne({ _id: shelterId });

  if (!shelter) {
    throw new CustomError.NotFoundError(`No shelter with id ${shelterId}`);
  }

  res.status(StatusCodes.OK).json({ msg: 'Success! Shelter removed' });
};

export {
  getAllShelters,
  createShelter,
  getShelter,
  updateShelter,
  deleteShelter,
};
