import { Request, Response } from 'express';
import { Activity } from '../models';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';

const getAllActivities = async (req: Request, res: Response) => {
  const activities = await Activity.find({});
  res.status(StatusCodes.OK).send({ activities, count: activities.length });
};

const createActivity = async (req: Request, res: Response) => {
  const { name, description, amount, unit } = req.body;

  if (!name || !description) {
    throw new CustomError.BadRequestError(
      'Please provide name and description'
    );
  }

  const activity = await Activity.create({
    name,
    description,
    amount,
    unit,
  });

  res.status(StatusCodes.CREATED).json({ activity });
};

const getActivity = async (req: Request, res: Response) => {
  const { id: activityId } = req.params;
  const activity = await Activity.findOne({ _id: activityId });
  if (!activity) {
    throw new CustomError.NotFoundError(`No activity with id ${activityId}`);
  }
  res.status(StatusCodes.OK).json({ activity });
};

const updateActivity = async (req: Request, res: Response) => {
  const { id: activityId } = req.params;
  const activity = await Activity.findOneAndUpdate(
    { _id: activityId },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!activity) {
    throw new CustomError.NotFoundError(`No activity with id ${activityId}`);
  }
  res.status(StatusCodes.OK).json({ activity });
};

const deleteActivity = async (req: Request, res: Response) => {
  const { id: activityId } = req.params;
  const activity = await Activity.findOne({ _id: activityId });
  if (!activity) {
    throw new CustomError.NotFoundError(`No activity with id ${activityId}`);
  }
  await activity.deleteOne();
  res.status(StatusCodes.OK).json({ msg: 'Success! Activity removed.' });
};

export {
  getAllActivities,
  createActivity,
  getActivity,
  updateActivity,
  deleteActivity,
};
