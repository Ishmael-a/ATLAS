import express, { Request, Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import chatRouter from './routes/chat.routes';

const app = express();

const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many requests from this IP, please try again after a minute.',
});

app.use(cors());
app.use(express.json());

app.use('/api/chat', chatRateLimiter, chatRouter);

app.get('/health', (req: Request, res: Response) => {
  res.send('System healthy!');
});

export default app;
