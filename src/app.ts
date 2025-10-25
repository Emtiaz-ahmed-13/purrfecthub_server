import cors from 'cors';
import express, { Application, Request, Response } from 'express';
const app: Application = express();

//parser
app.use(express.json());

//cors
app.use(cors());

//home
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

export default app;
