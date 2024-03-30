import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Animal, Herd } from '../models';
import CustomError from '../errors';
import { remove, upload } from './cloudinary';

const getAllAnimals = async (req: Request, res: Response) => {
  const animals = await Animal.find({}).populate({
    path: 'herd',
    select: 'herd',
    populate: {
      path: 'category',
      select: 'name',
    },
  });

  res.status(StatusCodes.OK).json({ animals, count: animals.length });
};

const createAnimal = async (req: Request, res: Response) => {
  const { name, gender, birth_weight, birth_date, is_harvested, herd } =
    req.body;

  const herdExist = await Herd.findOne({ _id: herd });
  if (!herdExist) {
    throw new CustomError.BadRequestError('Herd does not exists.');
  }

  if (!name) {
    throw new CustomError.BadRequestError('Please provide name of animal');
  }

  const animal = await Animal.create({
    name,
    gender,
    birth_date,
    birth_weight,
    is_harvested,
    herd,
  });

  res.status(StatusCodes.CREATED).json({ animal });
};

const getAnimal = async (req: Request, res: Response) => {
  const { id: animalId } = req.params;
  const animal = await Animal.findOne({
    _id: animalId,
  }).populate({
    path: 'herd',
    select: 'herd',
    populate: {
      path: 'category',
      select: 'name',
    },
  });

  if (!animal) {
    throw new CustomError.NotFoundError(`No animal with id ${animalId}`);
  }

  res.status(StatusCodes.OK).json({ animal });
};

const updateAnimal = async (req: Request, res: Response) => {
  const { id: animalId } = req.params;
  let herdExist;

  if (req.body.herd) {
    herdExist = await Herd.findOne({ _id: req.body.herd });
    if (!herdExist) {
      throw new CustomError.BadRequestError('Herd does not exists.');
    }
  }

  const animal = await Animal.findOneAndUpdate({ _id: animalId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!animal) {
    throw new CustomError.NotFoundError(`No animal with id ${animalId}`);
  }

  res.status(StatusCodes.OK).json({ animal });
};

const deleteAnimal = async (req: Request, res: Response) => {
  const { id: animalId } = req.params;
  const animal = await Animal.findOne({ _id: animalId });

  if (!animal) {
    throw new CustomError.NotFoundError(`No animal with id ${animalId}`);
  }

  const herd = await Herd.findOne({ _id: animal.herd });
  if (!herd) {
    throw new CustomError.BadRequestError('Herd does not exists');
  }

  await animal.deleteOne();
  if (animal.images.length !== 0) {
    remove(animal.images);
  }

  res.status(StatusCodes.OK).json({ msg: 'Success! Animal removed' });
};

const deleteHerdAnimals = async (req: Request, res: Response) => {
  const { id: herdId } = req.params;
  const herd = await Herd.findOne({ _id: herdId });

  if (!herd) {
    throw new CustomError.NotFoundError(`No herd with id ${herdId}`);
  }
  const animals = await Animal.find({ herd: herd._id });
  for (const animal of animals) {
    if (animal.images.length !== 0) {
      remove(animal.images);
    }
  }

  await Animal.deleteMany({ herd: herd._id });

  res.status(StatusCodes.OK).json({ msg: 'Success! Animals of herd removed' });
};

const uploadImages = async (req: Request, res: Response) => {
  if (!req.files) {
    throw new CustomError.BadRequestError('No files uploaded');
  }
  const { id: animalId } = req.params;
  const images = req.files as Express.Multer.File[];
  const imageUrls = await upload(images);

  const animal = await Animal.findOne({ _id: animalId });
  if (!animal) {
    remove(imageUrls);
    throw new CustomError.NotFoundError(`No animal with id ${animalId}`);
  }
  if (animal.images.length !== 0) {
    remove(animal.images);
  }

  animal.images = imageUrls;
  animal.save();

  res.status(StatusCodes.CREATED).json({ animal });
};

export {
  getAllAnimals,
  createAnimal,
  getAnimal,
  updateAnimal,
  deleteAnimal,
  deleteHerdAnimals,
  uploadImages,
};
