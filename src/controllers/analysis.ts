import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import { analyzeFarmEvents } from '../services/geminiService';
import {
  generatePrompt,
  generatePromptForHerds,
  generatePromptForResources,
  generatePromptForDiseases,
  generatePromptOverForFarm,
} from '../utils/promptGenerator';

const analysisCount = async (req: Request, res: Response) => {
  const prompt = generatePrompt(req.body);
  const result = await analyzeFarmEvents(prompt);
  if (!result) {
    throw new CustomError.BadRequestError('Failed to analyze events data');
  }
  res.status(StatusCodes.OK).json({ analysis: result });
};

const analysisHerd = async (req: Request, res: Response) => {
  const prompt = generatePromptForHerds(req.body);
  console.log(prompt);

  const result = await analyzeFarmEvents(prompt);
  if (!result) {
    throw new CustomError.BadRequestError('Failed to analyze events data');
  }
  res.status(StatusCodes.OK).json({ analysis: result, prompt });
};

const analysisResources = async (req: Request, res: Response) => {
  const prompt = generatePromptForResources(req.body);
  const result = await analyzeFarmEvents(prompt);
  if (!result) {
    throw new CustomError.BadRequestError('Failed to analyze events data');
  }
  res.status(StatusCodes.OK).json({ analysis: result });
};
const analysisDiseases = async (req: Request, res: Response) => {
  const prompt = generatePromptForDiseases(req.body);
  const result = await analyzeFarmEvents(prompt);
  if (!result) {
    throw new CustomError.BadRequestError('Failed to analyze events data');
  }
  res.status(StatusCodes.OK).json({ analysis: result });
};

const analysisFarm = async (req: Request, res: Response) => {
  const prompt = generatePromptOverForFarm(req.body);
  const result = await analyzeFarmEvents(prompt);
  if (!result) {
    throw new CustomError.BadRequestError('Failed to analyze events data');
  }
  res.status(StatusCodes.OK).json({ analysis: result });
};

export {
  analysisCount,
  analysisHerd,
  analysisResources,
  analysisDiseases,
  analysisFarm,
};
