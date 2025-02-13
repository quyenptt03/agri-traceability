import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import { Resource } from '../models';

const getAllResources = async (req: Request, res: Response) => {
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

  const resources = await Resource.find(queryObject)
    .skip(skip)
    .limit(limit)
    .sort(sortList);

  const totalCount: number = await Resource.countDocuments(queryObject);
  const totalPages: number = Math.ceil(totalCount / limit);

  res
    .status(StatusCodes.OK)
    .json({ resources, count: resources.length, page, totalPages });
};

const createResource = async (req: Request, res: Response) => {
  const { name, quantity, remain_qty, use_date, received_date, usage } =
    req.body;
  const resource = await Resource.create({
    name,
    quantity,
    remain_qty,
    use_date,
    received_date,
    usage,
  });

  if (!name) {
    throw new CustomError.BadRequestError('Please provide name of resources');
  }
  res.status(StatusCodes.CREATED).json({ resource });
};

const getResource = async (req: Request, res: Response) => {
  const { id: resourceId } = req.params;
  const resource = await Resource.findOne({ _id: resourceId });

  if (!resource) {
    throw new CustomError.NotFoundError(`No resource with id ${resourceId}`);
  }

  res.status(StatusCodes.OK).json({ resource });
};

const updateResource = async (req: Request, res: Response) => {
  const { id: resourceId } = req.params;
  const resource = await Resource.findOneAndUpdate(
    { _id: resourceId },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!resource) {
    throw new CustomError.NotFoundError(`No resource with id ${resourceId}`);
  }
  res.status(StatusCodes.OK).json({ resource });
};

const deleteResource = async (req: Request, res: Response) => {
  const { id: resourceId } = req.params;
  const resource = await Resource.findOne({ _id: resourceId });
  if (!resource) {
    throw new CustomError.NotFoundError(`No resource with id ${resourceId}`);
  }
  await resource.deleteOne();
  res.status(StatusCodes.OK).json({ msg: 'Success! Resource removed' });
};

export {
  createResource,
  getAllResources,
  getResource,
  updateResource,
  deleteResource,
};
