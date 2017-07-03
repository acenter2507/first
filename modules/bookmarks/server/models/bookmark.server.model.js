'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Bookmark Schema
 */
var BookmarkSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Bookmark name',
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

mongoose.model('Bookmark', BookmarkSchema);
