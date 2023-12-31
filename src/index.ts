import { config } from 'dotenv';
import 'express-async-errors';
//express
import express from 'express';
// others pakages
// import swaggerDocumentation from './helper/documentation';
// import swaggerDoc from 'swagger-ui-express';
import swaggerDocs from '../swagger';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

//database
import connectDB from './db/connect';
//routes
import {
  authRouter,
  activityRouter,
  categoryRouter,
  cultivationLogRouter,
  farmingAreaRouter,
  farmProductRouter,
  pestCategoryRouter,
  pestRouter,
  diseaseRouter,
  medicineRouter,
  treatmentRouter,
  qrCodeRouter,
  userRouter,
} from './routers';

//middlewares
import errorHandlerMiddleware from './middlewares/error-handler';

//config dotenv
config();

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// app.use('/docs', swaggerDoc.serve);
// app.use('/docs', swaggerDoc.setup(swaggerDocumentation));
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/farming-areas', farmingAreaRouter);
app.use('/api/v1/farm-products', farmProductRouter);
app.use('/api/v1/cultivation-logs', cultivationLogRouter);
app.use('/api/v1/activities', activityRouter);
app.use('/api/v1/pest-categories', pestCategoryRouter);
app.use('/api/v1/pests', pestRouter);
app.use('/api/v1/diseases', diseaseRouter);
app.use('/api/v1/medicines', medicineRouter);
app.use('/api/v1/treatments', treatmentRouter);
app.use('/api/v1/qrcode', qrCodeRouter);

app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await connectDB(process.env.DB_URI);
    app.listen(port, () => {
      console.log(`Server is listening at port ${port}`);
    });
    swaggerDocs(app, 5000);
  } catch (error) {
    console.log(error);
  }
};

start();
