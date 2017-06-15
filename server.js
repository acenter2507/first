'use strict';

/**
 * Module dependencies.
 */
var app = require('./config/lib/app');
process.on('error', (err) => {
	console.log(err);
})
var server = app.start();
