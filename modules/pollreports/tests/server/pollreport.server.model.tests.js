'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Pollreport = mongoose.model('Pollreport');

/**
 * Globals
 */
var user,
  pollreport;

/**
 * Unit tests
 */
describe('Pollreport Model Unit Tests:', function() {
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
      pollreport = new Pollreport({
        name: 'Pollreport Name',
        user: user
      });

      done();
    });
  });

  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      this.timeout(0);
      return pollreport.save(function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without name', function(done) {
      pollreport.name = '';

      return pollreport.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function(done) {
    Pollreport.remove().exec(function() {
      User.remove().exec(function() {
        done();
      });
    });
  });
});
