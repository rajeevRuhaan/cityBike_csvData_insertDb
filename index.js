import express from 'express';
import dotenv from 'dotenv';
import pkg from 'pg';
//requiring path and fs modules
import path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
// csv parser
import csv from 'csv-parser';

//joining path of directory 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

const directoryPath = path.join(__dirname, './data');
console.log("directory path", directoryPath)

dotenv.config({path: '../.env'});
const app = express();
const {Client} = pkg;

//
app.use(express.json());
app.use(express.urlencoded({
  extended: true,
}));
const results = [];

// passsing directoryPath and callback function
fs.readdir(directoryPath, function (err, files) {
  //handling error
  if (err) {
      return console.log('Unable to scan directory: ' + err);
  } 
  //listing all files using forEach
  files.forEach((file) => {
      // Do whatever you want to do with the file
      console.log(file); 
      const filepath = path.join(directoryPath, file)
      fs.createReadStream(filepath)
      .pipe(csv({delimiter: ','}))
      .on('data', (data) => {
        try {
          results.push(data)
        } catch (error) {
          console.log("Error:", error)
        }
       })
      .on('end', ()=> {
        console.log("file reading completed");
      })
  });
});
console.log(results.length)

const connectDb = async() => {
  try {
    const client = new Client({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: process.env.PGPORT
    })
    // waiting to connect 
    await client.connect((err) => {
      if(err) {
        console.log("Error connection", err)
        return;
      }
      console.log("connected to postgres successfully")
    });
    // create table


  // try to insert data if there is data
    try {
      client.query('DROP TABLE  IF EXISTS people')
      client.query(`CREATE TABLE IF NOT EXISTS people (
      id BIGSERIAL,
      fullname TEXT,
      gender TEXT,
      phone TEXT,
      age INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
  )`)
      const queryText = 'INSERT INTO people(id, fullname, gender, phone, age) VALUES ($1, $2, $3, $4, $5) RETURNING *'
      const values = [1, "rajeev", "male", "0987654321", 40, ];
      const res = await client.query(queryText, values);
      console.log(res.rows);

      await client.query('COMMIT')
    } catch (e) {
      await client.query('ROLLBACK')
      throw e;
    } 
    
   

  } catch (error) {
    console.log(error)
  }
}
connectDb();


app.get('/', (req, res) => {
    res.send('Hello World!');
  });

app.listen(3000, () => 
console.log('app is running at port 3000')

)