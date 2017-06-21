'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Cmtlike Schema
 */
var CmtlikeSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Cmtlike name',
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

mongoose.model('Cmtlike', CmtlikeSchema);
