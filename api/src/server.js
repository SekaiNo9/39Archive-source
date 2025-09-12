require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT;

db.connect();

app.listen(PORT, () => {
  });
 