const express = require('express')
const router = express.Router()
const UserController = require('../controllers/UserController')
const { authentication } = require('../middlewares/authentication')
const upload = require('../middlewares/upload')

router.post('/', upload.single('avatar'), UserController.register)
router.put('/:id', authentication, upload.single('avatar'), UserController.updateUser)
router.post('/login', UserController.login)
router.delete('/logout', authentication, UserController.logout)
router.get('/', authentication, UserController.getProfile)
router.get('/search/:name', authentication, UserController.findByName)
router.get('/:id', authentication, UserController.findById)
router.post('/:id/follow', authentication, UserController.follow)
router.post('/:id/unfollow', authentication, UserController.unfollow)

module.exports = router
