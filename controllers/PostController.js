const Post = require('../models/Post');

const PostController = {

    
  async createPost(req, res, next) {
    try {
      const { description, image } = req.body;

      if (!description) {
        return res.status(400).send({ message: 'La descripción es obligatoria' });
      }

      const newPost = await Post.create({
        description,
        image: image || '',
        author: req.user._id 
      });

      res.status(201).send({ message: 'Post creado con éxito', post: newPost });
    } catch (error) {
      error.origin = 'post';
      next(error);
    }
  },

  async updatePost(req, res, next) {
    
    try {
      const { id } = req.params;
      const { description, image } = req.body;

      const post = await Post.findById(id);

      if (!post) {
        return res.status(404).send({ message: 'Post no encontrado' });
      }

      // Solo el autor puede editar su post
      if (post.author.toString() !== req.user._id.toString()) {
        return res.status(403).send({ message: 'No tienes permiso para editar este post' });
      }

      // Validacion
      if (!description && !image) {
        return res.status(400).send({ message: 'Nada para actualizar' });
      }

      // Actualizar campos si vienen
      if (description) post.description = description;
      if (image !== undefined) post.image = image;

      await post.save();

      res.status(200).send({ message: 'Post actualizado', post });
    } catch (error) {
      error.origin = 'post';
      next(error);
    }
  },

  async deletePost(req, res, next) {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).send({ message: 'Post no encontrado' });
    }

    // Verificar autor
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).send({ message: 'No tienes permiso para eliminar este post' });
    }

    await Post.findByIdAndDelete(id);

    res.status(200).send({ message: 'Post eliminado correctamente' });
  } catch (error) {
    error.origin = 'post';
    next(error);
  }
},

async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const posts = await Post.find()
        .populate('author', 'name email')      
        .populate('comments')                   
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .sort({ createdAt: -1 });

      res.send(posts);
    } catch (error) {
      error.origin = 'post';
      next(error);
    }
  },

async findPostById(req, res, next) {

  try {
    const { id } = req.params;

    const post = await Post.findById(id)
      .populate('author', 'name email')
      .populate('comments');

    if (!post) {
      return res.status(404).send({ message: 'Post no encontrado' });
    }

    res.send({ post });
  } catch (error) {
    error.origin = 'post';
    next(error);
  }
},

  async getPostsByName(req, res) {

    try {
      const description = new RegExp(req.params.name, 'i');
      const posts = await Post.find({ description })
        .populate('author', 'name email')
        .populate('comments');
        res.send(posts);

    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error al buscar posts' });
    }
  },

  async likePost(req, res, next) {
    try {
      const postId = req.params.id;
      const userId = req.user._id;

      const post = await Post.findById(postId);
      if (!post) return res.status(404).send({ message: 'Post no encontrado' });

      if (post.likes.includes(userId)) {
        return res.status(400).send({ message: 'Ya has dado like a este post' });
      }

      post.likes.push(userId);
      await post.save();

      res.send({ message: 'Like añadido', likesCount: post.likes.length });
    } catch (error) {
      next(error);
    }
  },

  async unlikePost(req, res, next) {

    try {
      const postId = req.params.id;
      const userId = req.user._id;

      const post = await Post.findById(postId);
      if (!post) return res.status(404).send({ message: 'Post no encontrado' });

      const index = post.likes.indexOf(userId);
      if (index === -1) {
        return res.status(400).send({ message: 'No has dado like a este post' });
      }

      post.likes.splice(index, 1);
      await post.save();

      res.send({ message: 'Like quitado', likesCount: post.likes.length });
    } catch (error) {
      next(error);
    }
  }


}











module.exports = PostController;

