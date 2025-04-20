import { config } from 'dotenv';
import 'express-async-errors';
//express
import express from 'express';
// others pakages
// import swaggerDocumentation from './helper/documentation';
// import swaggerDoc from 'swagger-ui-express';
// import swaggerDocs from '../swagger';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cron from 'node-cron';

//database
import connectDB from './db/connect';
import ServerGlobal from './db/server-global';
//routes
import {
  authRouter,
  activityRouter,
  categoryRouter,
  cultivationLogRouter,
  farmRouter,
  roomRouter,
  herdRouter,
  animalRouter,
  productRouter,
  productInfoRouter,
  diseaseRouter,
  medicineRouter,
  treatmentRouter,
  qrCodeRouter,
  userRouter,
  harvestRouter,
  processorRouter,
  productPatchRouter,
  distributorRouter,
  shelterRouter,
  noticationRouter,
  resourceRouter,
  analysisRouter,
} from './routers';

//middlewares
import errorHandlerMiddleware from './middlewares/error-handler';

// services
import HerdMonitoringService from './services/herd-monitoring-service';

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
app.use('/api/v1/farms', farmRouter);
app.use('/api/v1/rooms', roomRouter);
app.use('/api/v1/herds', herdRouter);
app.use('/api/v1/animals', animalRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/product-infos', productInfoRouter);
app.use('/api/v1/cultivation-logs', cultivationLogRouter);
app.use('/api/v1/activities', activityRouter);
app.use('/api/v1/diseases', diseaseRouter);
app.use('/api/v1/medicines', medicineRouter);
app.use('/api/v1/resources', resourceRouter);
app.use('/api/v1/treatments', treatmentRouter);
app.use('/api/v1/harvests', harvestRouter);
app.use('/api/v1/processors', processorRouter);
app.use('/api/v1/product-patchs', productPatchRouter);
app.use('/api/v1/distributors', distributorRouter);
app.use('/api/v1/shelters', shelterRouter);
app.use('/api/v1/qrcode', qrCodeRouter);
app.use('/api/v1/notifications', noticationRouter);
app.use('/api/v1/analysis', analysisRouter);

app.use(errorHandlerMiddleware);

const herdMonitoringService = new HerdMonitoringService();

if (process.env.NODE_ENV != 'test') {
  cron.schedule('0 0 * * *', async () => {
    // cron.schedule('* * * * *', async () => {
    try {
      await herdMonitoringService.monitorHerds();
      // console.log('Herd monitoring job executed');
    } catch (error) {
      console.error('Error during herd monitoring job:', error);
    }
  });
}

const start = async () => {
  const serverGlobal = ServerGlobal.getInstance();
  try {
    await serverGlobal.connectDB(process.env.DB_URI);

    if (process.env.NODE_ENV !== 'test') {
      app.listen(port, () => {
        serverGlobal.logger.info(`Server is running on port ${port}`);
      });
    }
  } catch (error) {
    serverGlobal.logger.error(`Failed to start server: ${error}`);
  }
  // try {
  //   await connectDB(process.env.DB_URI);
  //   app.listen(port, () => {
  //     console.log(`Server is listening at port ${port}`);
  //   });
  // } catch (error) {
  //   console.log(error);
  // }
};

start();

export default app;
