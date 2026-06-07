import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user-routes.js';


dotenv.config();
const app = express();
app.use(cors({
    origin: '*',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Application/json'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



const port = process.env.PORT || 5000;

app.use('/api', userRoutes);


app.listen(port, () => {
    console.log(`* * * * * * * * * * * * * * * * * * * *`);
    console.log(`* * * * * * * * * * * * * * * * * * * *`);
    console.log(`Server is running on port ${port}`);
})
