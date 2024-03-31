import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import {
  CultivationLog,
  Distributor,
  Harvest,
  Herd,
  Processor,
  Product,
  TraceabilityInfo,
  Treatment,
} from '../models';

const createTraceabilityInfo = async (req: Request, res: Response) => {
  const traceabilityInfo = await TraceabilityInfo.create(req.body);

  res.status(StatusCodes.CREATED).json({ traceabilityInfo });
};

const getTraceabilityInfo = async (req: Request, res: Response) => {
  const { id: infoId } = req.params;

  const info = await TraceabilityInfo.findOne({ _id: infoId });
  if (!info) {
    throw new CustomError.NotFoundError('Not found');
  }
  const product = await Product.findOne({ _id: info.product });
  const herd = await Herd.findOne({
    _id: info.herd,
  })
    .populate({
      path: 'category',
      select: '_id name description',
    })
    .populate({
      path: 'farm',
      select: '_id name description area address coordinates images',
    });

  const harvest = await Harvest.findOne({ _id: info.harvest }).select(
    '_id name quantity unit date images'
  );
  const cultivationLogs = await CultivationLog.find({
    herd,
    date: {
      $lt: harvest.date,
    },
  });
  const processor = await Processor.findOne({ _id: info.processor }).select(
    '_id name location date images'
  );
  const distributor = await Distributor.findOne({
    _id: info.distributor,
  }).select(
    '_id warehouse_name warehouse_address images received_date delivery_date stores'
  );
  const treatments = await Treatment.find({
    herd,
    date: {
      $lt: harvest.date,
    },
  });

  res
    .status(StatusCodes.OK)
    .json({
      product,
      herd,
      cultivationLogs,
      harvest,
      processor,
      distributor,
      treatments,
    });
};

const updateTraceabilityInfo = async (req: Request, res: Response) => {
  const { id: infoId } = req.params;

  const { herd, product, harvest, processor, distributor } = req.body;

  if (herd) {
    const herdExist = await Herd.findOne({ _id: herd });
    if (!herdExist) {
      throw new CustomError.BadRequestError(`No herd with id ${herd}`);
    }
  }

  if (product) {
    const productExist = await Product.findOne({ _id: product });
    if (!productExist) {
      throw new CustomError.BadRequestError(`No product with id ${product}`);
    }
  }

  if (harvest) {
    const harvestExist = await Harvest.findOne({ _id: harvest });
    if (!harvestExist) {
      throw new CustomError.BadRequestError(`No harvest with id ${harvest}`);
    }
  }

  if (processor) {
    const processorExist = await Processor.findOne({ _id: processor });
    if (!processorExist) {
      throw new CustomError.BadRequestError(
        `No processor with id ${processor}`
      );
    }
  }

  if (distributor) {
    const distributorExist = await Distributor.findOne({ _id: distributor });
    if (!distributorExist) {
      throw new CustomError.BadRequestError(
        `No distributor with id ${distributor}`
      );
    }
  }

  const info = await TraceabilityInfo.findOneAndUpdate(req.body);
  if (!info) {
    throw new CustomError.NotFoundError(
      `No traceability info with id ${infoId}`
    );
  }

  res.status(StatusCodes.OK).json({ info });
};

const deleteTraceabilityInfo = async (req: Request, res: Response) => {
  const { id: infoId } = req.params;

  const info = await TraceabilityInfo.findOne({ _id: infoId });
  if (!info) {
    throw new CustomError.NotFoundError(
      `No traceability info with id ${infoId}`
    );
  }

  await info.deleteOne();

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Success! Traceability infomation removed.' });
};

// const scanQrcode = async (req: Request, res: Response) => {
//   const { id: herdId } = req.params;
//   const herd = await Herd.findOne({
//     _id: herdId,
//   })
//     .populate({
//       path: 'category',
//       select: '_id name description',
//     })
//     .populate('farm');
//   if (!herdId) {
//     throw new CustomError.NotFoundError(`No herd with id ${herd}`);
//   }
//   const cultivationLogs = await CultivationLog.find({
//     herd: herdId,
//   });
//   const harvests = await Harvest.find({ herd: herdId });
//   const treatments = await Treatment.find({
//     herd: herdId,
//   });

//   res
//     .status(StatusCodes.OK)
//     .json({ herd, cultivationLogs, harvests, treatments });
// };

export {
  createTraceabilityInfo,
  deleteTraceabilityInfo,
  getTraceabilityInfo,
  // scanQrcode,
  updateTraceabilityInfo,
};
