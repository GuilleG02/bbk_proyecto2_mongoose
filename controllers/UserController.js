const User = require('../models/User')
const Post = require('../models/Post');


const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { jwt_secret } = require('../config/keys.js')

const UserController = {

async register(req, res, next) {
  try {
    const { name, email, password, age } = req.body;

    //Generar el hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    //Crear usuario con la contraseña hasheada
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      age
    });

    //No devolver la contraseña en la respuesta
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).send({ message: 'Usuario registrado con éxito', user: userResponse });
  } catch (error) {
    error.origin = 'usuario'
    next(error)
  }
},

async login(req, res) {
  try {
    const user = await User.findOne({ email: req.body.email }).select('+password');

    if (!user) {
      return res.status(400).send({ message: 'Usuario o contraseña incorrectos' })
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) {
      return res.status(400).send({ message: 'Usuario o contraseña incorrectos' })
    }

    const token = jwt.sign({ _id: user._id }, jwt_secret)

    if (user.tokens.length > 3) user.tokens.shift()
    user.tokens.push(token)

    await user.save()
    res.send({ message: 'Bienvenid@ ' + user.name, token })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Error en login' })
  }
},


async logout(req, res) {
  try {
    // Extraer token sin 'Bearer '
    const token = req.headers.authorization?.replace('Bearer ', '');

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { tokens: token },
    });

    res.send({ message: 'Desconectado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: 'Hubo un problema al intentar desconectar al usuario',
    });
  }
},

async getProfile(req, res) {
  try {
    if (!req.user) {
      return res.status(401).send({ message: 'Usuario no autenticado' });
    }

    const user = await User.findById(req.user._id)
      .select('-password -tokens') // excluimos estos campos
      .populate('followers', 'name') 
      .lean(); // convierte a objeto JS plano 

    const posts = await Post.find({ author: req.user._id }).sort({ createdAt: -1 });

    const profile = {
      ...user,
      followersCount: user.followers?.length || 0,
      posts
    };

    res.send({ user: profile });
  } catch (error) {
    console.error('Error en getProfile:', error);
    res.status(500).send({ message: 'Error al obtener perfil del usuario' });
  }
},


async findByName(req, res, next) {

  try {

    const name = req.params.name;
    if (!name) {
      return res.status(400).send({ message: 'Debes proporcionar un nombre' });
    }

    const users = await User.find({
      name: { $regex: new RegExp(name, 'i') } // búsqueda parcial, insensible a mayúsculas
    }).select('-password -tokens');

    if (users.length === 0) {
      return res.status(404).send({ message: 'No se encontraron usuarios' });
    }

    res.send({ users });
  } catch (error) {
    error.origin = 'usuario';
    next(error);
  }
},



async findById(req, res, next) {

  try {

    const userId = req.params.id;
    const user = await User.findById(userId).select('-password -tokens'); // ocultamos el password y tokens otra vez

    if (!user) {
      return res.status(404).send({ message: 'Usuario no encontrado' });
    }

    res.send({ user });
  } catch (error) {
    error.origin = 'usuario';
    next(error);
  }
},


async follow(req, res, next) {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.id;

    if (currentUserId.equals(targetUserId)) {
      return res.status(400).send({ message: 'No puedes seguirte a ti mismo' });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).send({ message: 'Usuario no encontrado' });
    }

    if (currentUser.following.includes(targetUserId)) {
      return res.status(400).send({ message: 'Ya sigues a este usuario' });
    }

    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

    await currentUser.save();
    await targetUser.save();

    res.send({ message: `Ahora sigues a ${targetUser.name}` });
  } catch (error) {
    error.origin = 'usuario';
    next(error);
  }
},

async unfollow(req, res, next) {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.id;

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).send({ message: 'Usuario no encontrado' });
    }

    if (!currentUser.following.includes(targetUserId)) {
      return res.status(400).send({ message: 'No estás siguiendo a este usuario' });
    }

    currentUser.following.pull(targetUserId);
    targetUser.followers.pull(currentUserId);

    await currentUser.save();
    await targetUser.save();

    res.send({ message: `Has dejado de seguir a ${targetUser.name}` });
  } catch (error) {
    error.origin = 'usuario';
    next(error);
  }
},





}


module.exports = UserController
