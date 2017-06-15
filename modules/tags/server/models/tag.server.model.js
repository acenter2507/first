'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Tag Schema
 */
var TagSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Tag name',
    trim: true
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

mongoose.model('Tag', TagSchema);
