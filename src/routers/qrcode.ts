import {
  getAllTraceabilityInfos,
  getTraceabilityInfo,
} from '../controllers/qrcode';
import express from 'express';

const router = express.Router();

router.route('/').get(getAllTraceabilityInfos);
router.route('/:id').get(getTraceabilityInfo);

export default router;
