const mongoose = require('mongoose');

const { Schema, Types } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Por favor rellena tu nombre'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Por favor rellena tu correo'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+\@.+\..+/, 'Este correo no es válido'],
  },
  password: {
    type: String,
    required: [true, 'Por favor rellena tu contraseña'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false // para que no se devuelva por defecto en las consultas
  },
  age: {
    type: Number,
    required: [true, 'Por favor rellena tu edad'],
    min: [0, 'La edad no puede ser negativa']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  tokens: [{
    type: String
  }]
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

module.exports = User;