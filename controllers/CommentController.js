const Comment = require('../models/Comment');
const Post = require('../models/Post');


const CommentController = {

    async createComment(req, res, next) {

    try {
      const { content } = req.body;
      const postId = req.params.postId;

      if (!content) {
        return res.status(400).send({ message: 'El contenido del comentario es obligatorio' });
      }

      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).send({ message: 'Post no encontrado' });
      }

      const comment = await Comment.create({
        content,
        author: req.user._id,
        post: postId,
      });

      post.comments.push(comment._id);
      await post.save();

      const populatedComment = await comment.populate('author', 'name email');

      res.status(201).send({ message: 'Comentario creado con éxito', comment: populatedComment });
    } catch (error) {
      error.origin = 'comment';
      next(error);
    }
  },

  async likeComment(req, res, next) {

      try {
        const commentId = req.params.id;
        const userId = req.user._id;
  
        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).send({ message: 'Comentario no encontrado' });
  
        if (comment.likes.includes(userId)) {
          return res.status(400).send({ message: 'Ya has dado like a este comentario' });
        }
  
        comment.likes.push(userId);
        await comment.save();
  
        res.send({ message: 'Like añadido', likesCount: comment.likes.length });
      } catch (error) {
        next(error);
      }
    },
  
    async unlikeComment(req, res, next) {
  
      try {
        const commentId = req.params.id;
        const userId = req.user._id;
  
        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).send({ message: 'Post no encontrado' });
  
        const index = comment.likes.indexOf(userId);
        if (index === -1) {
          return res.status(400).send({ message: 'No has dado like a este post' });
        }
  
        comment.likes.splice(index, 1);
        await comment.save();
  
        res.send({ message: 'Like quitado', likesCount: comment.likes.length });
      } catch (error) {
        next(error);
      }
    },


    async updateComment(req, res, next) {

  try {

    const commentId = req.params.id;
    const userId = req.user._id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).send({ message: 'Debes hacer algun cambio' });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).send({ message: 'Comentario no encontrado' });
    }

    if (!comment.author.equals(userId)) {
      return res.status(403).send({ message: 'No puedes editar este comentario' });
    }

    comment.content = content;
    await comment.save();

    const updatedComment = await comment.populate('author', 'name email');

    res.send({ message: 'Comentario actualizado', comment: updatedComment });
  } catch (error) {
    error.origin = 'comment';
    next(error);
  }
},

async deleteComment(req, res, next) {

  try {

    const commentId = req.params.id;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).send({ message: 'Comentario no encontrado' });
    }

    if (!comment.author.equals(userId)) {
      return res.status(403).send({ message: 'No puedes eliminar este comentario' });
    }

    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id }

    });

    await comment.deleteOne();

    res.send({ message: 'Comentario eliminado con éxito' });
    
  } catch (error) {
    error.origin = 'comment';
    next(error);
  }
}



}


module.exports = CommentController;


