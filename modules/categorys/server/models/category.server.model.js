'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Category Schema
 */
var CategorySchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Category name',
    trim: true
  },
  des: {
    type: String,
    default: '',
    trim: true
  },
  icon: {
    type: String,
    default: 'fa-question'
  },
  color: {
    type: String,
    default: '#ECEFF1'
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Category', CategorySchema);
