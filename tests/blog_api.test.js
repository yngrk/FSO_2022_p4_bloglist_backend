const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');

const api = supertest(app);
const Blog = require('../models/blog');
const { initialBlogs, blogsInDb, nonExistingId } = require('./blog_test_helper');

beforeEach(async () => {
  await Blog.deleteMany();
  await Blog.insertMany(initialBlogs);
});

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('blogs unique id is "id"', async () => {
  const blogs = await blogsInDb();
  expect(blogs[0].id).toBeDefined();
});

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'A new Blog',
    author: 'New Guy',
    url: 'http://www.new-blog.com/',
    likes: 0,
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const currentBlogs = await blogsInDb();
  expect(currentBlogs.length).toBe(initialBlogs.length + 1);

  const titles = currentBlogs.map((b) => b.title);
  expect(titles).toContain('Awesome Blog');
});

test('if like property is missing, defaults to 0', async () => {
  const newBlog = {
    title: 'A new Blog',
    author: 'New Guy',
    url: 'http://www.new-blog.com/',
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const currentBlogs = await blogsInDb();
  currentBlogs.forEach((blog) => {
    expect(blog.likes).toBeDefined();
  });
});

test('missing title reponds with status 400', async () => {
  const blogMissingTitle = {
    author: 'New Guy',
    url: 'http://www.new-blog.com/',
    likes: 0,
  };

  await api
    .post('/api/blogs')
    .send(blogMissingTitle)
    .expect(400);

  const currentBlogs = await blogsInDb();

  expect(currentBlogs).toHaveLength(initialBlogs.length);
});

test('missing url reponds with status 400', async () => {
  const blogMissingUrl = {
    title: 'Blog with missing URL',
    author: 'New Guy',
    likes: 0,
  };

  await api
    .post('/api/blogs')
    .send(blogMissingUrl)
    .expect(400);

  const currentBlogs = await blogsInDb();

  expect(currentBlogs).toHaveLength(initialBlogs.length);
});

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204);

    const blogsAtEnd = await blogsInDb();
    expect(blogsAtEnd).toHaveLength(initialBlogs.length - 1);

    const titles = blogsAtEnd.map((blog) => blog.title);
    expect(titles).not.toContain(blogToDelete.title);
  });

  test('fails with unknown id', async () => {
    const unknownId = await nonExistingId();

    await api
      .delete(`/api/blogs/${unknownId}`)
      .expect(404);
  });
});

describe('updating a blog', () => {
  test('succeeds with valid values', async () => {
    const blogsAtStart = await blogsInDb();
    const blogToUpdate = { ...blogsAtStart[0] };
    blogToUpdate.likes = 999;

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await blogsInDb();
    const updatedBlog = blogsAtEnd.find((blog) => blog.id === blogToUpdate.id);
    expect(updatedBlog.likes).toBe(999);
  });

  test('fails with unknown id', async () => {
    const unknownId = await nonExistingId();

    await api
      .put(`/api/blogs/${unknownId}`)
      .expect(404);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
