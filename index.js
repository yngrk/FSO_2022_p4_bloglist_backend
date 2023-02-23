const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./utils/config');
const logger = require('./utils/logger');

const app = express();
const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
});

const Blog = mongoose.model('Blog', blogSchema);

mongoose.set('strictQuery', false);

logger.info('connecting to MongoDB...');
mongoose.connect(config.MONGODB_URI)
  .then(() => logger.info('connection successful.'))
  .catch((error) => logger.error(error));

app.use(cors());
app.use(express.json());

app.get('/api/blogs', (req, res) => {
  Blog.find({}).then((blogs) => res.json(blogs));
});

app.post('/api/blogs', (req, res) => {
  const blog = new Blog(req.body);
  blog.save().then((result) => res.status(201).json(result));
});

app.listen(config.PORT, () => logger.info(`Server running on port ${config.PORT}`));
