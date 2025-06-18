const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { jwt_secret } = require('../config/keys.js')

const UserController = {

async register(req, res, next) {
  try {
    const { name, email, password, age } = req.body;

    // 1. Generar el hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 2. Crear usuario con la contraseña hasheada
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      age
    });

    // 3. No devolver la contraseña en la respuesta
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
    const user = await User.findOne({ email: req.body.email })

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

    const userObj = req.user.toObject();
    const { password, tokens, ...userData } = userObj;

    res.send({ user: userData });
  } catch (error) {
    
    console.error('Error en getProfile:', error);
    res.status(500).send({ message: 'Error al obtener perfil del usuario' });
  }
},





}


module.exports = UserController
