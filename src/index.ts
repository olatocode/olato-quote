import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import connectDB from './config/db';
import quotesRouter from './routes/quotes';
import categoriesRouter from './routes/categories';
import swaggerDocument, { swaggerUiOptions } from './config/swagger';
import { ApiResponse } from './types';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.get('/health', (req, res) => {
  const response: ApiResponse<{ status: string }> = {
    data: { status: 'ok' },
    status: 'ok',
    message: 'Service is healthy',
  };
  res.json(response);
});

app.get('/', (req, res) => {
  const response: ApiResponse<{ name: string; version: string }> = {
    data: { name: 'Olato Quote API', version: '1.0.0' },
    status: 'ok',
    message: 'Welcome to Olato Quotes API',
  };
  res.json(response);
});

app.use('/v1', quotesRouter);
app.use('/v1', categoriesRouter);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerUiOptions));

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();

export default app;
