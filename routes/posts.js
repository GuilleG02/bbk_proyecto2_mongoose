const express = require('express')
const router = express.Router()
const PostController = require('../controllers/PostController')
const { authentication } = require('../middlewares/authentication')


router.post('/', authentication, PostController.createPost);
router.put('/:id', authentication, PostController.updatePost);
router.delete('/:id', authentication, PostController.deletePost);
router.get('/', PostController.getAll);
router.get('/:id', PostController.findPostById);
router.get('/search/:name', PostController.getPostsByName);
router.post('/like/:id', authentication, PostController.likePost);
router.post('/unlike/:id', authentication, PostController.unlikePost);

module.exports = router