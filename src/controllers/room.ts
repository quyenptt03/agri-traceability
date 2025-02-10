import { Request, Response } from 'express';
import { Room } from '../models';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import { remove, upload } from './cloudinary';

const getAllRoom = async (req: Request, res: Response) => {
  const rooms = await Room.find();
  res.status(StatusCodes.OK).send({ rooms, count: rooms.length });
};

const createRoom = async (req: Request, res: Response) => {
  if (!req.body.name) {
    throw new CustomError.BadRequestError('Please provide name');
  }

  const room = await Room.create(req.body);

  res.status(StatusCodes.CREATED).json({ room });
};

const getRoom = async (req: Request, res: Response) => {
  const { id: roomId } = req.params;
  const room = await Room.findOne({ _id: roomId });

  if (!room) {
    throw new CustomError.NotFoundError(`No room with id ${roomId}`);
  }

  res.status(StatusCodes.OK).json({ room });
};

const updateRoom = async (req: Request, res: Response) => {
  const { id: roomId } = req.params;

  const room = await Room.findOneAndUpdate({ _id: roomId }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!room) {
    throw new CustomError.NotFoundError(`No room with id ${roomId}`);
  }

  res.status(StatusCodes.OK).json({ room });
};

const deleteRoom = async (req: Request, res: Response) => {
  const { id: roomId } = req.params;
  const room = await Room.findOne({ _id: roomId });
  if (!room) {
    throw new CustomError.NotFoundError(`No room with id ${roomId}`);
  }
  await room.deleteOne();
  if (room.images.length !== 0) {
    remove(room.images);
  }
  res.status(StatusCodes.OK).json({ msg: 'Success! Room removed' });
};

const uploadImages = async (req: Request, res: Response) => {
  if (!req.files) {
    throw new CustomError.BadRequestError('No files uploaded');
  }
  const { id: rommId } = req.params;
  const images = req.files as Express.Multer.File[];
  const imageUrls = upload(images);

  const room = await Room.findOne({ _id: rommId });
  if (!room) {
    remove(room.images);
    throw new CustomError.NotFoundError(`No room with id ${rommId}`);
  }
  if (room.images.length !== 0) {
    remove(room.images);
  }

  room.images = imageUrls;
  room.save();

  res.status(StatusCodes.CREATED).json({ room });
};

export {
  getAllRoom,
  createRoom,
  getRoom,
  updateRoom,
  deleteRoom,
  uploadImages,
};
