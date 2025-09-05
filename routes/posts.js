const express = require('express');
const router = express.Router();
const PostController = require('../controllers/PostController');
const { authentication } = require('../middlewares/authentication');
const upload = require('../middlewares/upload');

// Crear post con imagen
router.post('/', authentication, upload.single('image'), PostController.createPost);

// Actualizar post con imagen
router.put('/:id', authentication, upload.single('image'), PostController.updatePost);

// Eliminar post
router.delete('/:id', authentication, PostController.deletePost);

// Buscar posts por nombre
router.get('/search/:name', PostController.getPostsByName);

// Obtener post por ID
router.get('/:id', PostController.findPostById);

// Obtener todos los posts
router.get('/', PostController.getAll);

// Dar/Quitar like
router.post('/:id/toggleLike', authentication, PostController.toggleLike);

module.exports = router;
