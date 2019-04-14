const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');

const Blog = mongoose.model('Blog');

const clearCache = require('../middlewares/cleanCache');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  app.get('/api/blogs', requireLogin, clearCache, async (req, res) => {
    /* const redis = require('redis');
    const client = redis.createClient('//127.0.0.1:6379');
    const util = require('util');
    client.get = util.promisify(client.get);
    const cachedBlogs = await client.get(req.user.id);

    if (cachedBlogs) {
      console.log('serving from cache', cachedBlogs);
      return res.send(JSON.parse(cachedBlogs));
    }
    const blogs = await Blog.find({ _user: req.user.id });

    res.send(blogs);
    client.set(req.user.id, JSON.stringify(blogs)); */
    const blogs = await Blog.find({ _user: req.user.id }).cache({
      key: req.user.id
    });
    res.send(blogs);
  });

  app.post('/api/blogs', requireLogin, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
  });
};
