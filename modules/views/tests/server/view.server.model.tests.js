'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  View = mongoose.model('View');

/**
 * Globals
 */
var user,
  view;

/**
 * Unit tests
 */
describe('View Model Unit Tests:', function() {
  beforeEach(function(done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password'
    });

    user.save(function() {
      view = new View({
        name: 'View Name',
        user: user
      });

      done();
    });
  });

  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      this.timeout(0);
      return view.save(function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without name', function(done) {
      view.name = '';

      return view.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function(done) {
    View.remove().exec(function() {
      User.remove().exec(function() {
        done();
      });
    });
  });
});
