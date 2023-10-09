import { scanQrcode } from '../controllers/qrcode';
import express from 'express';

const router = express.Router();

router.route('/:id').get(scanQrcode);

export default router;
