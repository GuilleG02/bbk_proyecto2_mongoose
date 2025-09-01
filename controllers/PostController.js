const Post = require('../models/Post');
const Comment = require('../models/Comment');

const PostController = {


  async createPost(req, res, next) {
    try {
      const { description } = req.body;
      const image = req.file ? req.file.filename : '';

      if (!description) {
        return res.status(400).send({ message: 'La descripción es obligatoria' });
      }

      const newPost = await Post.create({
        description,
        image,
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
      const { description } = req.body;
      const image = req.file ? req.file.filename : undefined;

      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).send({ message: 'Post no encontrado' });
      }

      if (post.author.toString() !== req.user._id.toString()) {
        return res.status(403).send({ message: 'No tienes permiso para editar este post' });
      }

      if (!description && image === undefined) {
        return res.status(400).send({ message: 'Nada para actualizar' });
      }

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
        .populate({
          path: 'comments',
          populate: {
            path: 'author',
            select: 'name email'
          }
        })
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

  async toggleLike(req, res, next) {
    try {
      const postId = req.params.id;
      const userId = req.user._id;

      const post = await Post.findById(postId);
      if (!post) return res.status(404).send({ message: 'Post no encontrado' });

      const index = post.likes.indexOf(userId);

      if (index >= 0) {
        // Ya tiene like, lo quitamos
        post.likes.splice(index, 1);
        await post.save();
        return res.send({ message: 'Like quitado', liked: false, likesCount: post.likes.length });
      } else {
        // No tiene like, lo agregamos
        post.likes.push(userId);
        await post.save();
        return res.send({
          message: index >= 0 ? 'Like quitado' : 'Like añadido',
          liked: index < 0,
          likesCount: post.likes.length,
          post, // ← enviar el post actualizado
        })

      }

    } catch (error) {
      next(error);
    }
  }



}











module.exports = PostController;

