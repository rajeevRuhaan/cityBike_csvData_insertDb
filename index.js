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
const {Pool} = pkg;

//
app.use(express.json());
app.use(express.urlencoded({
  extended: true,
}));


// passsing directoryPath and callback function
/* fs.readdir(directoryPath, function (err, files) {
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
}); */


const connectDb = async() => {
  try {
    const pool = new Pool({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: process.env.PGPORT
    })
    // waiting to connect 
    await pool.connect((err) => {
      if(err) {
        console.log("Error connection", err)
        return;
      }
      console.log("connected to postgres successfully")
    });
    // create table


  // try to insert data if there is data
      const createTableQuery = `CREATE TABLE IF NOT EXISTS journey(
        departure TIMESTAMP,
        return TIMESTAMP,
        departure_station_id TEXT,
        departure_station_name TEXT,
        return_station_id TEXT,
        return_station_name TEXT,
        covered_distance_m TEXT,
        duration_sec TEXT

      )`; 

      // Execute the query
      pool.query(createTableQuery)
      .then(() => 
        console.log("table created"),
      )
      .catch(error => {
        console.error('Error creating table:', error);
      })

      const queryText = 'INSERT INTO journey(departure, return, departure_station_id, departure_station_name, return_station_id, return_station_name, covered_distance_m, duration_sec) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *'
      const values = ['2021-05-31T23:57:26', '2021-06-01T00:05:47', '094', 'Laajalahden aukio', '100', 'Teljäntie', '2043', '500'];
      pool.query(queryText, values)
      .then(()=> 
      console.log("done value insertion")
      )
      .catch (error =>{ 
        console.error('Error inserting values:', error)
      })
      

    
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