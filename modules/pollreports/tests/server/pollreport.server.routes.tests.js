'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Pollreport = mongoose.model('Pollreport'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  pollreport;

/**
 * Pollreport routes tests
 */
describe('Pollreport CRUD tests', function () {

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

    // Save a user to the test db and create new Pollreport
    user.save(function () {
      pollreport = {
        name: 'Pollreport name'
      };

      done();
    });
  });

  it('should be able to save a Pollreport if logged in', function (done) {
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

        // Save a new Pollreport
        agent.post('/api/pollreports')
          .send(pollreport)
          .expect(200)
          .end(function (pollreportSaveErr, pollreportSaveRes) {
            // Handle Pollreport save error
            if (pollreportSaveErr) {
              return done(pollreportSaveErr);
            }

            // Get a list of Pollreports
            agent.get('/api/pollreports')
              .end(function (pollreportsGetErr, pollreportsGetRes) {
                // Handle Pollreports save error
                if (pollreportsGetErr) {
                  return done(pollreportsGetErr);
                }

                // Get Pollreports list
                var pollreports = pollreportsGetRes.body;

                // Set assertions
                (pollreports[0].user._id).should.equal(userId);
                (pollreports[0].name).should.match('Pollreport name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Pollreport if not logged in', function (done) {
    agent.post('/api/pollreports')
      .send(pollreport)
      .expect(403)
      .end(function (pollreportSaveErr, pollreportSaveRes) {
        // Call the assertion callback
        done(pollreportSaveErr);
      });
  });

  it('should not be able to save an Pollreport if no name is provided', function (done) {
    // Invalidate name field
    pollreport.name = '';

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

        // Save a new Pollreport
        agent.post('/api/pollreports')
          .send(pollreport)
          .expect(400)
          .end(function (pollreportSaveErr, pollreportSaveRes) {
            // Set message assertion
            (pollreportSaveRes.body.message).should.match('Please fill Pollreport name');

            // Handle Pollreport save error
            done(pollreportSaveErr);
          });
      });
  });

  it('should be able to update an Pollreport if signed in', function (done) {
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

        // Save a new Pollreport
        agent.post('/api/pollreports')
          .send(pollreport)
          .expect(200)
          .end(function (pollreportSaveErr, pollreportSaveRes) {
            // Handle Pollreport save error
            if (pollreportSaveErr) {
              return done(pollreportSaveErr);
            }

            // Update Pollreport name
            pollreport.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Pollreport
            agent.put('/api/pollreports/' + pollreportSaveRes.body._id)
              .send(pollreport)
              .expect(200)
              .end(function (pollreportUpdateErr, pollreportUpdateRes) {
                // Handle Pollreport update error
                if (pollreportUpdateErr) {
                  return done(pollreportUpdateErr);
                }

                // Set assertions
                (pollreportUpdateRes.body._id).should.equal(pollreportSaveRes.body._id);
                (pollreportUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Pollreports if not signed in', function (done) {
    // Create new Pollreport model instance
    var pollreportObj = new Pollreport(pollreport);

    // Save the pollreport
    pollreportObj.save(function () {
      // Request Pollreports
      request(app).get('/api/pollreports')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Pollreport if not signed in', function (done) {
    // Create new Pollreport model instance
    var pollreportObj = new Pollreport(pollreport);

    // Save the Pollreport
    pollreportObj.save(function () {
      request(app).get('/api/pollreports/' + pollreportObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', pollreport.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Pollreport with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/pollreports/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Pollreport is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Pollreport which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Pollreport
    request(app).get('/api/pollreports/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Pollreport with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Pollreport if signed in', function (done) {
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

        // Save a new Pollreport
        agent.post('/api/pollreports')
          .send(pollreport)
          .expect(200)
          .end(function (pollreportSaveErr, pollreportSaveRes) {
            // Handle Pollreport save error
            if (pollreportSaveErr) {
              return done(pollreportSaveErr);
            }

            // Delete an existing Pollreport
            agent.delete('/api/pollreports/' + pollreportSaveRes.body._id)
              .send(pollreport)
              .expect(200)
              .end(function (pollreportDeleteErr, pollreportDeleteRes) {
                // Handle pollreport error error
                if (pollreportDeleteErr) {
                  return done(pollreportDeleteErr);
                }

                // Set assertions
                (pollreportDeleteRes.body._id).should.equal(pollreportSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Pollreport if not signed in', function (done) {
    // Set Pollreport user
    pollreport.user = user;

    // Create new Pollreport model instance
    var pollreportObj = new Pollreport(pollreport);

    // Save the Pollreport
    pollreportObj.save(function () {
      // Try deleting Pollreport
      request(app).delete('/api/pollreports/' + pollreportObj._id)
        .expect(403)
        .end(function (pollreportDeleteErr, pollreportDeleteRes) {
          // Set message assertion
          (pollreportDeleteRes.body.message).should.match('User is not authorized');

          // Handle Pollreport error error
          done(pollreportDeleteErr);
        });

    });
  });

  it('should be able to get a single Pollreport that has an orphaned user reference', function (done) {
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

          // Save a new Pollreport
          agent.post('/api/pollreports')
            .send(pollreport)
            .expect(200)
            .end(function (pollreportSaveErr, pollreportSaveRes) {
              // Handle Pollreport save error
              if (pollreportSaveErr) {
                return done(pollreportSaveErr);
              }

              // Set assertions on new Pollreport
              (pollreportSaveRes.body.name).should.equal(pollreport.name);
              should.exist(pollreportSaveRes.body.user);
              should.equal(pollreportSaveRes.body.user._id, orphanId);

              // force the Pollreport to have an orphaned user reference
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

                    // Get the Pollreport
                    agent.get('/api/pollreports/' + pollreportSaveRes.body._id)
                      .expect(200)
                      .end(function (pollreportInfoErr, pollreportInfoRes) {
                        // Handle Pollreport error
                        if (pollreportInfoErr) {
                          return done(pollreportInfoErr);
                        }

                        // Set assertions
                        (pollreportInfoRes.body._id).should.equal(pollreportSaveRes.body._id);
                        (pollreportInfoRes.body.name).should.equal(pollreport.name);
                        should.equal(pollreportInfoRes.body.user, undefined);

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
      Pollreport.remove().exec(done);
    });
  });
});
