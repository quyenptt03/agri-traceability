import { config } from 'dotenv';
import 'express-async-errors';
//express
import express from 'express';
//database
import connectDB from './db/connect';
//routes
import {
  activityRouter,
  categoryRouter,
  cultivationLogRouter,
  farmingAreaRouter,
  farmProductRouter,
  pestCategoryRouter,
  pestRouter,
  medicineRouter,
  qrCodeRouter,
} from './routers';
import swaggerDocs from '../swagger';
// import swaggerDoc from 'swagger-ui-express';

//middlewares
import bodyParser from 'body-parser';
import errorHandlerMiddleware from './middlewares/error-handler';

// others
// import swaggerDocumentation from './helper/documentation';
import cors from 'cors';
import morgan from 'morgan';

//config dotenv
config();

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// app.use('/docs', swaggerDoc.serve);
// app.use('/docs', swaggerDoc.setup(swaggerDocumentation));

app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/farming-areas', farmingAreaRouter);
app.use('/api/v1/farm-products', farmProductRouter);
app.use('/api/v1/cultivation-logs', cultivationLogRouter);
app.use('/api/v1/activities', activityRouter);
app.use('/api/v1/pest-categories', pestCategoryRouter);
app.use('/api/v1/pests', pestRouter);
app.use('/api/v1/medicines', medicineRouter);
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
