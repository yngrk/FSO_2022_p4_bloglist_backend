const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./utils/config');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');
const blogsRouter = require('./controllers/blogs');
require('express-async-errors');

const app = express();

mongoose.set('strictQuery', false);

logger.info('connecting to MongoDB...');
mongoose.connect(config.MONGODB_URI)
  .then(() => logger.info('connection successful.'))
  .catch((error) => logger.error(error));

app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);

app.use('/api/blogs', blogsRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
