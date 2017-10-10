'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  slug = require('mongoose-url-slugs'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

/**
 * Category Schema
 */
var CategorySchema = new Schema({
  name: { type: String, required: 'Please fill Category name', trim: true },
  des: { type: String, default: '', trim: true },
  icon: { type: String, default: 'fa-question' },
  color: { type: String, default: '#ECEFF1' },
  created: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: 'User' }
});
CategorySchema.plugin(slug('name', { update: true }));
CategorySchema.plugin(paginate);

mongoose.model('Category', CategorySchema);
