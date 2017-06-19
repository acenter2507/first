'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Cmt Schema
 */
var CmtSchema = new Schema({
  body: {
    type: String,
    default: '',
    required: 'Please fill Comment body',
    trim: true
  },
  poll: {
    type: Schema.ObjectId,
    ref: 'Poll'
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  updated: {
    type: Date,
    default: Date.now
  },
  isEdited: {
    type: Boolean,
    default: false
  }
});

CmtSchema.pre('save', function(next){
  next();
});

mongoose.model('Cmt', CmtSchema);
