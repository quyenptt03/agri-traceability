import express from "express";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  getCategory,
  deleteCategory
} from "../controllers/category";
import uploadCloud from "../middlewares/uploadCloud";

const router = express.Router();

router
  .route("/")
  .get(getAllCategories)
  .post(uploadCloud.single("image"), createCategory);

router
  .route("/:id")
  .get(getCategory)
  .patch(uploadCloud.single("image"), updateCategory)
  .delete(deleteCategory)

export default router;
