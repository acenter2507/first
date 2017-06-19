'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Voteopt Schema
 */
var VoteoptSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Voteopt name',
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

mongoose.model('Voteopt', VoteoptSchema);
