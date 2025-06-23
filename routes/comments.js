const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/CommentController');
const { authentication } = require('../middlewares/authentication');
const upload = require('../middlewares/upload');

router.post('/:postId', authentication, upload.single('image'), CommentController.createComment);
router.put('/:id', authentication, upload.single('image'), CommentController.updateComment);
router.post('/like/:id', authentication, CommentController.likeComment);
router.post('/unlike/:id', authentication, CommentController.unlikeComment);
router.delete('/:id', authentication, CommentController.deleteComment);

module.exports = router;
