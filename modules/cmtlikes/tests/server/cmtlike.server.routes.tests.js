'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Cmtlike = mongoose.model('Cmtlike'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  cmtlike;

/**
 * Cmtlike routes tests
 */
describe('Cmtlike CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Cmtlike
    user.save(function () {
      cmtlike = {
        name: 'Cmtlike name'
      };

      done();
    });
  });

  it('should be able to save a Cmtlike if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Cmtlike
        agent.post('/api/cmtlikes')
          .send(cmtlike)
          .expect(200)
          .end(function (cmtlikeSaveErr, cmtlikeSaveRes) {
            // Handle Cmtlike save error
            if (cmtlikeSaveErr) {
              return done(cmtlikeSaveErr);
            }

            // Get a list of Cmtlikes
            agent.get('/api/cmtlikes')
              .end(function (cmtlikesGetErr, cmtlikesGetRes) {
                // Handle Cmtlikes save error
                if (cmtlikesGetErr) {
                  return done(cmtlikesGetErr);
                }

                // Get Cmtlikes list
                var cmtlikes = cmtlikesGetRes.body;

                // Set assertions
                (cmtlikes[0].user._id).should.equal(userId);
                (cmtlikes[0].name).should.match('Cmtlike name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Cmtlike if not logged in', function (done) {
    agent.post('/api/cmtlikes')
      .send(cmtlike)
      .expect(403)
      .end(function (cmtlikeSaveErr, cmtlikeSaveRes) {
        // Call the assertion callback
        done(cmtlikeSaveErr);
      });
  });

  it('should not be able to save an Cmtlike if no name is provided', function (done) {
    // Invalidate name field
    cmtlike.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Cmtlike
        agent.post('/api/cmtlikes')
          .send(cmtlike)
          .expect(400)
          .end(function (cmtlikeSaveErr, cmtlikeSaveRes) {
            // Set message assertion
            (cmtlikeSaveRes.body.message).should.match('Please fill Cmtlike name');

            // Handle Cmtlike save error
            done(cmtlikeSaveErr);
          });
      });
  });

  it('should be able to update an Cmtlike if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Cmtlike
        agent.post('/api/cmtlikes')
          .send(cmtlike)
          .expect(200)
          .end(function (cmtlikeSaveErr, cmtlikeSaveRes) {
            // Handle Cmtlike save error
            if (cmtlikeSaveErr) {
              return done(cmtlikeSaveErr);
            }

            // Update Cmtlike name
            cmtlike.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Cmtlike
            agent.put('/api/cmtlikes/' + cmtlikeSaveRes.body._id)
              .send(cmtlike)
              .expect(200)
              .end(function (cmtlikeUpdateErr, cmtlikeUpdateRes) {
                // Handle Cmtlike update error
                if (cmtlikeUpdateErr) {
                  return done(cmtlikeUpdateErr);
                }

                // Set assertions
                (cmtlikeUpdateRes.body._id).should.equal(cmtlikeSaveRes.body._id);
                (cmtlikeUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Cmtlikes if not signed in', function (done) {
    // Create new Cmtlike model instance
    var cmtlikeObj = new Cmtlike(cmtlike);

    // Save the cmtlike
    cmtlikeObj.save(function () {
      // Request Cmtlikes
      request(app).get('/api/cmtlikes')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Cmtlike if not signed in', function (done) {
    // Create new Cmtlike model instance
    var cmtlikeObj = new Cmtlike(cmtlike);

    // Save the Cmtlike
    cmtlikeObj.save(function () {
      request(app).get('/api/cmtlikes/' + cmtlikeObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', cmtlike.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Cmtlike with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/cmtlikes/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Cmtlike is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Cmtlike which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Cmtlike
    request(app).get('/api/cmtlikes/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Cmtlike with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Cmtlike if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Cmtlike
        agent.post('/api/cmtlikes')
          .send(cmtlike)
          .expect(200)
          .end(function (cmtlikeSaveErr, cmtlikeSaveRes) {
            // Handle Cmtlike save error
            if (cmtlikeSaveErr) {
              return done(cmtlikeSaveErr);
            }

            // Delete an existing Cmtlike
            agent.delete('/api/cmtlikes/' + cmtlikeSaveRes.body._id)
              .send(cmtlike)
              .expect(200)
              .end(function (cmtlikeDeleteErr, cmtlikeDeleteRes) {
                // Handle cmtlike error error
                if (cmtlikeDeleteErr) {
                  return done(cmtlikeDeleteErr);
                }

                // Set assertions
                (cmtlikeDeleteRes.body._id).should.equal(cmtlikeSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Cmtlike if not signed in', function (done) {
    // Set Cmtlike user
    cmtlike.user = user;

    // Create new Cmtlike model instance
    var cmtlikeObj = new Cmtlike(cmtlike);

    // Save the Cmtlike
    cmtlikeObj.save(function () {
      // Try deleting Cmtlike
      request(app).delete('/api/cmtlikes/' + cmtlikeObj._id)
        .expect(403)
        .end(function (cmtlikeDeleteErr, cmtlikeDeleteRes) {
          // Set message assertion
          (cmtlikeDeleteRes.body.message).should.match('User is not authorized');

          // Handle Cmtlike error error
          done(cmtlikeDeleteErr);
        });

    });
  });

  it('should be able to get a single Cmtlike that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Cmtlike
          agent.post('/api/cmtlikes')
            .send(cmtlike)
            .expect(200)
            .end(function (cmtlikeSaveErr, cmtlikeSaveRes) {
              // Handle Cmtlike save error
              if (cmtlikeSaveErr) {
                return done(cmtlikeSaveErr);
              }

              // Set assertions on new Cmtlike
              (cmtlikeSaveRes.body.name).should.equal(cmtlike.name);
              should.exist(cmtlikeSaveRes.body.user);
              should.equal(cmtlikeSaveRes.body.user._id, orphanId);

              // force the Cmtlike to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Cmtlike
                    agent.get('/api/cmtlikes/' + cmtlikeSaveRes.body._id)
                      .expect(200)
                      .end(function (cmtlikeInfoErr, cmtlikeInfoRes) {
                        // Handle Cmtlike error
                        if (cmtlikeInfoErr) {
                          return done(cmtlikeInfoErr);
                        }

                        // Set assertions
                        (cmtlikeInfoRes.body._id).should.equal(cmtlikeSaveRes.body._id);
                        (cmtlikeInfoRes.body.name).should.equal(cmtlike.name);
                        should.equal(cmtlikeInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Cmtlike.remove().exec(done);
    });
  });
});
