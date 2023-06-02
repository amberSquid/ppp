import express from 'express';
import cors from 'cors';
import mysql from 'mysql';

import userRouter from './routes/users.js'

const app = express();
app.use(express.json())
app.use(cors());
app.use(express.urlencoded({ extended: true }));


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: 'Amber2023',
    database: 'qatar-db'
})

    db.connect(function (err) {
            if (err) throw err;
            console.log('Connected to database');
        })

app.listen(3000, (err) => {
    if(err) throw err;
    console.log('Listening on port 3000');   
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.use('/api/users', userRouter);



export default db;