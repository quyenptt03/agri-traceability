import express from 'express';
import {
  getAllProductInfo,
  createProductInfo,
  getProductInfo,
  updateProductInfo,
  deleteProductInfo,
} from '../controllers/product-info';
import { authenticateUser } from '../middlewares/authentication';

const router = express.Router();

router
  .route('/')
  .get(getAllProductInfo)
  .post(authenticateUser, createProductInfo);

router
  .route('/:id')
  .get(getProductInfo)
  .patch(authenticateUser, updateProductInfo)
  .delete(authenticateUser, deleteProductInfo);

export default router;
