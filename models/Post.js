const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const PostSchema = new Schema({

  description: {
    type: String,
    required: [true, 'La descripcion es obligatorio'],
    trim: true,
  },
  image: {
    type: String, 
    default: ''
  },

  author: {
    type: Types.ObjectId,
    ref: 'User',
    required: [true, 'El autor es obligatorio']
  },

  comments: [{
    type: Types.ObjectId,
    ref: 'Comment'
  }],

  likes: [{
    type: Types.ObjectId,
    ref: 'User'
  }]
  
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
