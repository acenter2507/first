'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Polltag = mongoose.model('Polltag'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  polltag;

/**
 * Polltag routes tests
 */
describe('Polltag CRUD tests', function () {

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

    // Save a user to the test db and create new Polltag
    user.save(function () {
      polltag = {
        name: 'Polltag name'
      };

      done();
    });
  });

  it('should be able to save a Polltag if logged in', function (done) {
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

        // Save a new Polltag
        agent.post('/api/polltags')
          .send(polltag)
          .expect(200)
          .end(function (polltagSaveErr, polltagSaveRes) {
            // Handle Polltag save error
            if (polltagSaveErr) {
              return done(polltagSaveErr);
            }

            // Get a list of Polltags
            agent.get('/api/polltags')
              .end(function (polltagsGetErr, polltagsGetRes) {
                // Handle Polltags save error
                if (polltagsGetErr) {
                  return done(polltagsGetErr);
                }

                // Get Polltags list
                var polltags = polltagsGetRes.body;

                // Set assertions
                (polltags[0].user._id).should.equal(userId);
                (polltags[0].name).should.match('Polltag name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Polltag if not logged in', function (done) {
    agent.post('/api/polltags')
      .send(polltag)
      .expect(403)
      .end(function (polltagSaveErr, polltagSaveRes) {
        // Call the assertion callback
        done(polltagSaveErr);
      });
  });

  it('should not be able to save an Polltag if no name is provided', function (done) {
    // Invalidate name field
    polltag.name = '';

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

        // Save a new Polltag
        agent.post('/api/polltags')
          .send(polltag)
          .expect(400)
          .end(function (polltagSaveErr, polltagSaveRes) {
            // Set message assertion
            (polltagSaveRes.body.message).should.match('Please fill Polltag name');

            // Handle Polltag save error
            done(polltagSaveErr);
          });
      });
  });

  it('should be able to update an Polltag if signed in', function (done) {
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

        // Save a new Polltag
        agent.post('/api/polltags')
          .send(polltag)
          .expect(200)
          .end(function (polltagSaveErr, polltagSaveRes) {
            // Handle Polltag save error
            if (polltagSaveErr) {
              return done(polltagSaveErr);
            }

            // Update Polltag name
            polltag.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Polltag
            agent.put('/api/polltags/' + polltagSaveRes.body._id)
              .send(polltag)
              .expect(200)
              .end(function (polltagUpdateErr, polltagUpdateRes) {
                // Handle Polltag update error
                if (polltagUpdateErr) {
                  return done(polltagUpdateErr);
                }

                // Set assertions
                (polltagUpdateRes.body._id).should.equal(polltagSaveRes.body._id);
                (polltagUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Polltags if not signed in', function (done) {
    // Create new Polltag model instance
    var polltagObj = new Polltag(polltag);

    // Save the polltag
    polltagObj.save(function () {
      // Request Polltags
      request(app).get('/api/polltags')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Polltag if not signed in', function (done) {
    // Create new Polltag model instance
    var polltagObj = new Polltag(polltag);

    // Save the Polltag
    polltagObj.save(function () {
      request(app).get('/api/polltags/' + polltagObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', polltag.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Polltag with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/polltags/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Polltag is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Polltag which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Polltag
    request(app).get('/api/polltags/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Polltag with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Polltag if signed in', function (done) {
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

        // Save a new Polltag
        agent.post('/api/polltags')
          .send(polltag)
          .expect(200)
          .end(function (polltagSaveErr, polltagSaveRes) {
            // Handle Polltag save error
            if (polltagSaveErr) {
              return done(polltagSaveErr);
            }

            // Delete an existing Polltag
            agent.delete('/api/polltags/' + polltagSaveRes.body._id)
              .send(polltag)
              .expect(200)
              .end(function (polltagDeleteErr, polltagDeleteRes) {
                // Handle polltag error error
                if (polltagDeleteErr) {
                  return done(polltagDeleteErr);
                }

                // Set assertions
                (polltagDeleteRes.body._id).should.equal(polltagSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Polltag if not signed in', function (done) {
    // Set Polltag user
    polltag.user = user;

    // Create new Polltag model instance
    var polltagObj = new Polltag(polltag);

    // Save the Polltag
    polltagObj.save(function () {
      // Try deleting Polltag
      request(app).delete('/api/polltags/' + polltagObj._id)
        .expect(403)
        .end(function (polltagDeleteErr, polltagDeleteRes) {
          // Set message assertion
          (polltagDeleteRes.body.message).should.match('User is not authorized');

          // Handle Polltag error error
          done(polltagDeleteErr);
        });

    });
  });

  it('should be able to get a single Polltag that has an orphaned user reference', function (done) {
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

          // Save a new Polltag
          agent.post('/api/polltags')
            .send(polltag)
            .expect(200)
            .end(function (polltagSaveErr, polltagSaveRes) {
              // Handle Polltag save error
              if (polltagSaveErr) {
                return done(polltagSaveErr);
              }

              // Set assertions on new Polltag
              (polltagSaveRes.body.name).should.equal(polltag.name);
              should.exist(polltagSaveRes.body.user);
              should.equal(polltagSaveRes.body.user._id, orphanId);

              // force the Polltag to have an orphaned user reference
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

                    // Get the Polltag
                    agent.get('/api/polltags/' + polltagSaveRes.body._id)
                      .expect(200)
                      .end(function (polltagInfoErr, polltagInfoRes) {
                        // Handle Polltag error
                        if (polltagInfoErr) {
                          return done(polltagInfoErr);
                        }

                        // Set assertions
                        (polltagInfoRes.body._id).should.equal(polltagSaveRes.body._id);
                        (polltagInfoRes.body.name).should.equal(polltag.name);
                        should.equal(polltagInfoRes.body.user, undefined);

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
      Polltag.remove().exec(done);
    });
  });
});
