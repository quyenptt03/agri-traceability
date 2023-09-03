import { config } from "dotenv";
import "express-async-errors";
//express
import express from "express";
//database
import connectDB from "./db/connect";
//routes
import categoryRouter from "./routers/category";
import bodyParser from "body-parser";
import upload from "multer";
import errorHandlerMiddleware from "./middlewares/error-handler";

//config dotenv
config();

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1/categories", categoryRouter);

app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await connectDB(process.env.DB_URI);
    app.listen(port, () => {
      console.log(`Server is listening at port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
