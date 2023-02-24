const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({});
  res.status(200).json(blogs);
});

blogsRouter.post('/', async (req, res) => {
  const blog = new Blog(req.body);

  if (!blog.likes) { blog.likes = 0; }
  if (!blog.title) { res.status(400).end(); return; }
  if (!blog.url) { res.status(400).end(); return; }

  const savedBlog = await blog.save();
  res.status(201).json(savedBlog);
});

blogsRouter.put('/:id', async (req, res) => {
  const updatedBlog = req.body;
  const blog = await Blog.findByIdAndUpdate(req.params.id, updatedBlog);
  if (blog) {
    res.status(200).json(updatedBlog);
  } else {
    res.status(404).end();
  }
});

blogsRouter.delete('/:id', async (req, res) => {
  const blog = await Blog.findByIdAndRemove(req.params.id);
  if (blog) {
    res.status(204).json(blog);
  } else {
    res.status(404).end();
  }
});

module.exports = blogsRouter;
