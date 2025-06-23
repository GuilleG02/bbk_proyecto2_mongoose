const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const CommentSchema = new Schema({

  content: {
    type: String,
    required: [true, 'El contenido del comentario es obligatorio'],
    trim: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  image: {
  type: String,
  default: ''
},
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  likes: [{
    type: Types.ObjectId,
    ref: 'User'
  }]
  
}, {
  timestamps: true,
});

module.exports = mongoose.model('Comment', CommentSchema);
