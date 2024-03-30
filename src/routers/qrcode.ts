import { getTraceabilityInfo } from '../controllers/qrcode';
import express from 'express';

const router = express.Router();

router.route('/:id').get(getTraceabilityInfo);

export default router;
