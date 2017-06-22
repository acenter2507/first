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
  to: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  toName: {
    type: String,
    default: ''
  },
  updated: {
    type: Date,
    default: Date.now
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  likeCnt: {
    type: Number,
    default: 0
  }
});

CmtSchema.pre('save', function(next){
  next();
});

CmtSchema.statics.countLike = function(id, cnt, callback) {
  return this.findById(id).exec(function(err, cmt) {
    cmt.likeCnt += cnt;
    return cmt.save();
  });
};

mongoose.model('Cmt', CmtSchema);
