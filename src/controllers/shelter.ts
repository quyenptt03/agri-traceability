import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Room, Shelter } from '../models';
import CustomError from '../errors';

const getAllShelters = async (req: Request, res: Response) => {
  const shelters = await Shelter.find({}).populate({
    path: 'room',
    select: '-_id name',
  });
  res.status(StatusCodes.OK).json({ shelters, count: shelters.length });
};

const createShelter = async (req: Request, res: Response) => {
  const { room, cameraId } = req.body;

  const shelter = await Shelter.create({
    room,
    cameraId,
  });

  res.status(StatusCodes.CREATED).json({ shelter });
};

const getShelter = async (req: Request, res: Response) => {
  const { id: shelterId } = req.params;
  const shelter = await Shelter.findOne({
    _id: shelterId,
  }).populate({
    path: 'room',
    select: '-_id name',
  });

  if (!shelter) {
    throw new CustomError.NotFoundError(`No shelter with id ${shelterId}`);
  }

  res.status(StatusCodes.OK).json({ shelter });
};

const updateShelter = async (req: Request, res: Response) => {
  const { id: shelterId } = req.params;
  let roomExist;

  if (req.body.herd) {
    roomExist = await Room.findOne({ _id: req.body.room });
    if (!roomExist) {
      throw new CustomError.BadRequestError('Room does not exists.');
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

  await shelter.deleteOne();

  res.status(StatusCodes.OK).json({ msg: 'Success! Shelter removed' });
};

export {
  getAllShelters,
  createShelter,
  getShelter,
  updateShelter,
  deleteShelter,
};
