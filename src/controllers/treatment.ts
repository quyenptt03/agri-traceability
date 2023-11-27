import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import { Pest, PestCategory } from '../models';
import { remove, upload } from './cloudinary';

const getAllTreatment = async (req: Request, res: Response) => {};

const createTreatment = async (req: Request, res: Response) => {};

const getTreatment = async (req: Request, res: Response) => {};

const updateTreatment = async (req: Request, res: Response) => {};

const deleteTreatment = async (req: Request, res: Response) => {};

const uploadImages = async (req: Request, res: Response) => {};

export {
  createTreatment,
  deleteTreatment,
  getAllTreatment,
  getTreatment,
  updateTreatment,
  uploadImages,
};
