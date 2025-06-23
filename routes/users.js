const express = require('express')
const router = express.Router()
const UserController = require('../controllers/UserController')
const { authentication } = require('../middlewares/authentication')


router.post('/', UserController.register)
router.post('/login', UserController.login)
router.delete('/logout', authentication, UserController.logout)
router.get('/', authentication, UserController.getProfile);
router.get('/search/:name', authentication, UserController.findByName);
router.get('/:id', authentication, UserController.findById);
router.post('/follow/:id', authentication, UserController.follow);
router.post('/unfollow/:id', authentication, UserController.unfollow);

module.exports = router