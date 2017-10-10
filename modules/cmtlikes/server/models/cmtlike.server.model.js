'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

/**
 * Cmtlike Schema
 */
var CmtlikeSchema = new Schema({
  cmt: { type: Schema.ObjectId, ref: 'Cmt' },
  created: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: 'User' },
  type: { type: Number, default: 0 } // 1: like, 2: dislike
});
CmtlikeSchema.plugin(paginate);

mongoose.model('Cmtlike', CmtlikeSchema);
