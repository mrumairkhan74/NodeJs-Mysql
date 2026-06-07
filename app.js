import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js';
import { register } from './test-Controller.js';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());



const port = process.env.PORT || 5000;

app.post('/api/register', register);


app.listen(port, () => {
    console.log(`\n * * * * * * * * * * * * * * * * * * * *`);
    console.log(`Server is running on port ${port}`);
    console.log(`\n * * * * * * * * * * * * * * * * * * * *`);
})
