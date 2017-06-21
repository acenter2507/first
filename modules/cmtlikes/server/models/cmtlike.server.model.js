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
  cmt: {
    type: Schema.ObjectId,
    ref: 'Cmt'
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  type: {
    type: Number,
    default: 1 // 1: like, 2: dislike
  }
});

mongoose.model('Cmtlike', CmtlikeSchema);
