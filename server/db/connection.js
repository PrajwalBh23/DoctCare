const mongoose = require('mongoose');       
const dotenv = require('dotenv');           

dotenv.config();

const DB = process.env.DATABASE;

mongoose.connect(DB)
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err.message);
  });