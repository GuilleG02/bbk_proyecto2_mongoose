const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/CommentController');
const { authentication } = require('../middlewares/authentication')

router.post('/:postId', authentication, CommentController.createComment);
router.post('/like/:id', authentication, CommentController.likeComment);
router.post('/unlike/:id', authentication, CommentController.unlikeComment);

module.exports = router;
