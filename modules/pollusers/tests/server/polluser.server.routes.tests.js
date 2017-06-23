'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Polluser = mongoose.model('Polluser'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  polluser;

/**
 * Polluser routes tests
 */
describe('Polluser CRUD tests', function () {

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

    // Save a user to the test db and create new Polluser
    user.save(function () {
      polluser = {
        name: 'Polluser name'
      };

      done();
    });
  });

  it('should be able to save a Polluser if logged in', function (done) {
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

        // Save a new Polluser
        agent.post('/api/pollusers')
          .send(polluser)
          .expect(200)
          .end(function (polluserSaveErr, polluserSaveRes) {
            // Handle Polluser save error
            if (polluserSaveErr) {
              return done(polluserSaveErr);
            }

            // Get a list of Pollusers
            agent.get('/api/pollusers')
              .end(function (pollusersGetErr, pollusersGetRes) {
                // Handle Pollusers save error
                if (pollusersGetErr) {
                  return done(pollusersGetErr);
                }

                // Get Pollusers list
                var pollusers = pollusersGetRes.body;

                // Set assertions
                (pollusers[0].user._id).should.equal(userId);
                (pollusers[0].name).should.match('Polluser name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Polluser if not logged in', function (done) {
    agent.post('/api/pollusers')
      .send(polluser)
      .expect(403)
      .end(function (polluserSaveErr, polluserSaveRes) {
        // Call the assertion callback
        done(polluserSaveErr);
      });
  });

  it('should not be able to save an Polluser if no name is provided', function (done) {
    // Invalidate name field
    polluser.name = '';

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

        // Save a new Polluser
        agent.post('/api/pollusers')
          .send(polluser)
          .expect(400)
          .end(function (polluserSaveErr, polluserSaveRes) {
            // Set message assertion
            (polluserSaveRes.body.message).should.match('Please fill Polluser name');

            // Handle Polluser save error
            done(polluserSaveErr);
          });
      });
  });

  it('should be able to update an Polluser if signed in', function (done) {
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

        // Save a new Polluser
        agent.post('/api/pollusers')
          .send(polluser)
          .expect(200)
          .end(function (polluserSaveErr, polluserSaveRes) {
            // Handle Polluser save error
            if (polluserSaveErr) {
              return done(polluserSaveErr);
            }

            // Update Polluser name
            polluser.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Polluser
            agent.put('/api/pollusers/' + polluserSaveRes.body._id)
              .send(polluser)
              .expect(200)
              .end(function (polluserUpdateErr, polluserUpdateRes) {
                // Handle Polluser update error
                if (polluserUpdateErr) {
                  return done(polluserUpdateErr);
                }

                // Set assertions
                (polluserUpdateRes.body._id).should.equal(polluserSaveRes.body._id);
                (polluserUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Pollusers if not signed in', function (done) {
    // Create new Polluser model instance
    var polluserObj = new Polluser(polluser);

    // Save the polluser
    polluserObj.save(function () {
      // Request Pollusers
      request(app).get('/api/pollusers')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Polluser if not signed in', function (done) {
    // Create new Polluser model instance
    var polluserObj = new Polluser(polluser);

    // Save the Polluser
    polluserObj.save(function () {
      request(app).get('/api/pollusers/' + polluserObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', polluser.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Polluser with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/pollusers/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Polluser is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Polluser which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Polluser
    request(app).get('/api/pollusers/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Polluser with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Polluser if signed in', function (done) {
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

        // Save a new Polluser
        agent.post('/api/pollusers')
          .send(polluser)
          .expect(200)
          .end(function (polluserSaveErr, polluserSaveRes) {
            // Handle Polluser save error
            if (polluserSaveErr) {
              return done(polluserSaveErr);
            }

            // Delete an existing Polluser
            agent.delete('/api/pollusers/' + polluserSaveRes.body._id)
              .send(polluser)
              .expect(200)
              .end(function (polluserDeleteErr, polluserDeleteRes) {
                // Handle polluser error error
                if (polluserDeleteErr) {
                  return done(polluserDeleteErr);
                }

                // Set assertions
                (polluserDeleteRes.body._id).should.equal(polluserSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Polluser if not signed in', function (done) {
    // Set Polluser user
    polluser.user = user;

    // Create new Polluser model instance
    var polluserObj = new Polluser(polluser);

    // Save the Polluser
    polluserObj.save(function () {
      // Try deleting Polluser
      request(app).delete('/api/pollusers/' + polluserObj._id)
        .expect(403)
        .end(function (polluserDeleteErr, polluserDeleteRes) {
          // Set message assertion
          (polluserDeleteRes.body.message).should.match('User is not authorized');

          // Handle Polluser error error
          done(polluserDeleteErr);
        });

    });
  });

  it('should be able to get a single Polluser that has an orphaned user reference', function (done) {
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

          // Save a new Polluser
          agent.post('/api/pollusers')
            .send(polluser)
            .expect(200)
            .end(function (polluserSaveErr, polluserSaveRes) {
              // Handle Polluser save error
              if (polluserSaveErr) {
                return done(polluserSaveErr);
              }

              // Set assertions on new Polluser
              (polluserSaveRes.body.name).should.equal(polluser.name);
              should.exist(polluserSaveRes.body.user);
              should.equal(polluserSaveRes.body.user._id, orphanId);

              // force the Polluser to have an orphaned user reference
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

                    // Get the Polluser
                    agent.get('/api/pollusers/' + polluserSaveRes.body._id)
                      .expect(200)
                      .end(function (polluserInfoErr, polluserInfoRes) {
                        // Handle Polluser error
                        if (polluserInfoErr) {
                          return done(polluserInfoErr);
                        }

                        // Set assertions
                        (polluserInfoRes.body._id).should.equal(polluserSaveRes.body._id);
                        (polluserInfoRes.body.name).should.equal(polluser.name);
                        should.equal(polluserInfoRes.body.user, undefined);

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
      Polluser.remove().exec(done);
    });
  });
});
