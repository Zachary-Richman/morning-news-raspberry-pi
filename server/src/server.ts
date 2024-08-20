import express, { Response, Request } from 'express';
import { news_handling } from './news_handing.ts';

import * as dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
const news_api: news_handling = new news_handling();

app.get('/api/:query', async (req: Request, res: Response) =>{
   const resp = await news_api.combine_text(req.params.query, process.env.THE_NEWS_API_KEY);
   res.send(resp);
});

app.listen(port, () => {
   console.log('Listening on port ' + port);
});