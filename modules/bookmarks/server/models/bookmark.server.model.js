'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

/**
 * Bookmark Schema
 */
var BookmarkSchema = new Schema({
  poll: { type : Schema.ObjectId, ref : 'Poll' },
  created: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: 'User' }
});
BookmarkSchema.plugin(paginate);

mongoose.model('Bookmark', BookmarkSchema);
