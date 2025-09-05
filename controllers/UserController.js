const User = require('../models/User')
const Post = require('../models/Post')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { jwt_secret } = require('../config/keys.js')

const handleValidationError = (err, res) => {
  const errors = Object.values(err.errors).map(el => el.message)
  const message = errors.length > 0 ? errors.join(' || ') : 'Error de validación'
  res.status(400).send({ message })
}

const UserController = {
  register: async (req, res, next) => {
    try {
      let { name, email, password, age } = req.body
      age = Number(age)
      if (isNaN(age)) return res.status(400).send({ message: 'Edad inválida' })

      const hashedPassword = await bcrypt.hash(password, 10)
      let avatarPath = '/uploads/avatar.png'
      if (req.file) avatarPath = `/uploads/${req.file.filename}`

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        age,
        avatar: avatarPath,
        tokens: []
      })

      const token = jwt.sign({ _id: user._id }, jwt_secret)
      user.tokens.push(token)
      await user.save()

      const userResponse = user.toObject()
      delete userResponse.password

      res.status(201).send({ message: 'Usuario registrado con éxito', user: userResponse, token })
    } catch (error) {
      if (error.name === 'ValidationError') return handleValidationError(error, res)
      if (error.code === 11000) return res.status(400).send({ message: 'El correo ya existe' })
      next(error)
    }
  },

  login: async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email }).select('+password')
      if (!user) return res.status(400).send({ message: 'Usuario o contraseña incorrectos' })

      const validPassword = await bcrypt.compare(req.body.password, user.password)
      if (!validPassword) return res.status(400).send({ message: 'Usuario o contraseña incorrectos' })

      const token = jwt.sign({ _id: user._id }, jwt_secret)
      if (user.tokens.length > 3) user.tokens.shift()
      user.tokens.push(token)
      await user.save()

      const userResponse = user.toObject()
      delete userResponse.password

      res.send({ message: 'Bienvenid@ ' + user.name, user: userResponse, token })
    } catch (error) {
      res.status(500).send({ message: 'Error en login' })
    }
  },

  logout: async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '')
      await User.findByIdAndUpdate(req.user._id, { $pull: { tokens: token } })
      res.send({ message: 'Desconectado con éxito' })
    } catch (error) {
      res.status(500).send({ message: 'Error al desconectar usuario' })
    }
  },

  getProfile: async (req, res) => {
    try {
      if (!req.user) return res.status(401).send({ message: 'Usuario no autenticado' })

      const user = await User.findById(req.user._id)
        .select('-password -tokens')
        .populate('following', 'name avatar')  
        .populate('followers', 'name avatar')  
        .lean()

      const posts = await Post.find({ author: req.user._id })
        .sort({ createdAt: -1 })
        .populate('author', 'name avatar')

      res.send({ user: { ...user, followersCount: user.followers?.length || 0, posts } })
    } catch (error) {
      res.status(500).send({ message: 'Error al obtener perfil' })
    }
  },

  updateUser: async (req, res, next) => {
    try {
      const userId = req.params.id
      const updateData = { ...req.body }

      if (req.file) updateData.avatar = `/uploads/${req.file.filename}`
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10)
      }

      const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true })
        .select('-password -tokens')

      if (!updatedUser) return res.status(404).send({ message: 'Usuario no encontrado' })
      res.send({ message: 'Usuario actualizado', user: updatedUser })
    } catch (error) {
      if (error.name === 'ValidationError') return handleValidationError(error, res)
      next(error)
    }
  },

  follow: async (req, res) => {
    try {
      const userIdToFollow = req.params.id
      const currentUser = req.user
      if (!currentUser) return res.status(401).send({ message: 'Usuario no autenticado' })
      if (currentUser._id.toString() === userIdToFollow)
        return res.status(400).send({ message: 'No puedes seguirte a ti mismo' })

      if (!currentUser.following.includes(userIdToFollow)) {
        currentUser.following.push(userIdToFollow)
        await currentUser.save()
      }

      const followedUser = await User.findById(userIdToFollow)
      if (!followedUser.followers.includes(currentUser._id)) {
        followedUser.followers.push(currentUser._id)
        await followedUser.save()
      }

      res.send({ message: 'Usuario seguido', following: currentUser.following })
    } catch (error) {
      res.status(500).send({ message: 'Error al seguir usuario' })
    }
  },

  unfollow: async (req, res) => {
    try {
      const userIdToUnfollow = req.params.id
      const currentUser = req.user
      if (!currentUser) return res.status(401).send({ message: 'Usuario no autenticado' })

      currentUser.following = currentUser.following.filter(
        id => id.toString() !== userIdToUnfollow
      )
      await currentUser.save()

      const unfollowedUser = await User.findById(userIdToUnfollow)
      unfollowedUser.followers = unfollowedUser.followers.filter(
        id => id.toString() !== currentUser._id.toString()
      )
      await unfollowedUser.save()

      res.send({ message: 'Usuario dejado de seguir', following: currentUser.following })
    } catch (error) {
      res.status(500).send({ message: 'Error al dejar de seguir usuario' })
    }
  },

  findById: async (req, res) => res.status(501).send({ message: 'findById no implementado' }),
  findByName: async (req, res) => res.status(501).send({ message: 'findByName no implementado' }),
}

module.exports = UserController
