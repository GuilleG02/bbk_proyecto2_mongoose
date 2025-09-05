const Post = require('../models/Post');

const PostController = {
  async createPost(req, res, next) {
    try {
      const { description } = req.body;
      const image = req.file ? req.file.filename : '';

      if (!description) return res.status(400).send({ message: 'La descripción es obligatoria' });

      const newPost = await Post.create({
        description,
        image,
        author: req.user._id
      });

      res.status(201).send({ message: 'Post creado con éxito', post: newPost });
    } catch (error) {
      next(error);
    }
  },

  async updatePost(req, res, next) {
    try {
      const { id } = req.params;
      const { description } = req.body;
      const image = req.file ? req.file.filename : undefined;

      const post = await Post.findById(id);
      if (!post) return res.status(404).send({ message: 'Post no encontrado' });
      if (post.author.toString() !== req.user._id.toString()) return res.status(403).send({ message: 'No tienes permiso para editar este post' });

      if (description) post.description = description;
      if (image !== undefined) post.image = image;

      await post.save();
      res.status(200).send({ message: 'Post actualizado', post });
    } catch (error) {
      next(error);
    }
  },

  async deletePost(req, res, next) {
    try {
      const { id } = req.params;
      const post = await Post.findById(id);
      if (!post) return res.status(404).send({ message: 'Post no encontrado' });
      if (post.author.toString() !== req.user._id.toString()) return res.status(403).send({ message: 'No tienes permiso para eliminar este post' });

      await Post.findByIdAndDelete(id);
      res.status(200).send({ message: 'Post eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const posts = await Post.find()
        .populate('author', 'name avatar')
        .populate({ path: 'comments', populate: { path: 'author', select: 'name avatar' } })
        .sort({ createdAt: -1 });

      res.send(posts);
    } catch (error) {
      next(error);
    }
  },

  async findPostById(req, res, next) {
    try {
      const post = await Post.findById(req.params.id)
        .populate('author', 'name avatar')
        .populate({ path: 'comments', populate: { path: 'author', select: 'name avatar' } });

      if (!post) return res.status(404).send({ message: 'Post no encontrado' });
      res.send({ post });
    } catch (error) {
      next(error);
    }
  },

  async getPostsByName(req, res, next) {
    try {
      const regex = new RegExp(req.params.name, 'i');
      const posts = await Post.find({ description: regex })
        .populate('author', 'name avatar')
        .populate({ path: 'comments', populate: { path: 'author', select: 'name avatar' } });

      res.send(posts);
    } catch (error) {
      next(error);
    }
  },

  async toggleLike(req, res, next) {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).send({ message: 'Post no encontrado' });

      const userId = req.user._id.toString();
      const index = post.likes.findIndex(id => id.toString() === userId);

      if (index >= 0) post.likes.splice(index, 1);
      else post.likes.push(userId);

      await post.save();
      res.send({ message: index >= 0 ? 'Like quitado' : 'Like añadido', liked: index < 0, likesCount: post.likes.length, post });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = PostController;
