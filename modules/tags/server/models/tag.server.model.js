'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  slug = require('mongoose-url-slugs'),
  Schema = mongoose.Schema;

/**
 * Tag Schema
 */
var TagSchema = new Schema({
  name: { type: String, required: 'Please fill Tag name', trim: true },
  des: { type: String, default: '', trim: true },
  count: { type: 'Number', default: 0 },
  created: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: 'User' },
  updated: { type: Date, default: Date.now }
});
TagSchema.plugin(slug('name', { update: true }));
TagSchema.plugin(paginate);

TagSchema.pre('save', function (next) {
  this.updated = new Date();
  next();
});

mongoose.model('Tag', TagSchema);
