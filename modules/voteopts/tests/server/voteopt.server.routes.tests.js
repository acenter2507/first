'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Voteopt = mongoose.model('Voteopt'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  voteopt;

/**
 * Voteopt routes tests
 */
describe('Voteopt CRUD tests', function () {

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

    // Save a user to the test db and create new Voteopt
    user.save(function () {
      voteopt = {
        name: 'Voteopt name'
      };

      done();
    });
  });

  it('should be able to save a Voteopt if logged in', function (done) {
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

        // Save a new Voteopt
        agent.post('/api/voteopts')
          .send(voteopt)
          .expect(200)
          .end(function (voteoptSaveErr, voteoptSaveRes) {
            // Handle Voteopt save error
            if (voteoptSaveErr) {
              return done(voteoptSaveErr);
            }

            // Get a list of Voteopts
            agent.get('/api/voteopts')
              .end(function (voteoptsGetErr, voteoptsGetRes) {
                // Handle Voteopts save error
                if (voteoptsGetErr) {
                  return done(voteoptsGetErr);
                }

                // Get Voteopts list
                var voteopts = voteoptsGetRes.body;

                // Set assertions
                (voteopts[0].user._id).should.equal(userId);
                (voteopts[0].name).should.match('Voteopt name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Voteopt if not logged in', function (done) {
    agent.post('/api/voteopts')
      .send(voteopt)
      .expect(403)
      .end(function (voteoptSaveErr, voteoptSaveRes) {
        // Call the assertion callback
        done(voteoptSaveErr);
      });
  });

  it('should not be able to save an Voteopt if no name is provided', function (done) {
    // Invalidate name field
    voteopt.name = '';

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

        // Save a new Voteopt
        agent.post('/api/voteopts')
          .send(voteopt)
          .expect(400)
          .end(function (voteoptSaveErr, voteoptSaveRes) {
            // Set message assertion
            (voteoptSaveRes.body.message).should.match('Please fill Voteopt name');

            // Handle Voteopt save error
            done(voteoptSaveErr);
          });
      });
  });

  it('should be able to update an Voteopt if signed in', function (done) {
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

        // Save a new Voteopt
        agent.post('/api/voteopts')
          .send(voteopt)
          .expect(200)
          .end(function (voteoptSaveErr, voteoptSaveRes) {
            // Handle Voteopt save error
            if (voteoptSaveErr) {
              return done(voteoptSaveErr);
            }

            // Update Voteopt name
            voteopt.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Voteopt
            agent.put('/api/voteopts/' + voteoptSaveRes.body._id)
              .send(voteopt)
              .expect(200)
              .end(function (voteoptUpdateErr, voteoptUpdateRes) {
                // Handle Voteopt update error
                if (voteoptUpdateErr) {
                  return done(voteoptUpdateErr);
                }

                // Set assertions
                (voteoptUpdateRes.body._id).should.equal(voteoptSaveRes.body._id);
                (voteoptUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Voteopts if not signed in', function (done) {
    // Create new Voteopt model instance
    var voteoptObj = new Voteopt(voteopt);

    // Save the voteopt
    voteoptObj.save(function () {
      // Request Voteopts
      request(app).get('/api/voteopts')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Voteopt if not signed in', function (done) {
    // Create new Voteopt model instance
    var voteoptObj = new Voteopt(voteopt);

    // Save the Voteopt
    voteoptObj.save(function () {
      request(app).get('/api/voteopts/' + voteoptObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', voteopt.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Voteopt with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/voteopts/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Voteopt is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Voteopt which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Voteopt
    request(app).get('/api/voteopts/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Voteopt with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Voteopt if signed in', function (done) {
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

        // Save a new Voteopt
        agent.post('/api/voteopts')
          .send(voteopt)
          .expect(200)
          .end(function (voteoptSaveErr, voteoptSaveRes) {
            // Handle Voteopt save error
            if (voteoptSaveErr) {
              return done(voteoptSaveErr);
            }

            // Delete an existing Voteopt
            agent.delete('/api/voteopts/' + voteoptSaveRes.body._id)
              .send(voteopt)
              .expect(200)
              .end(function (voteoptDeleteErr, voteoptDeleteRes) {
                // Handle voteopt error error
                if (voteoptDeleteErr) {
                  return done(voteoptDeleteErr);
                }

                // Set assertions
                (voteoptDeleteRes.body._id).should.equal(voteoptSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Voteopt if not signed in', function (done) {
    // Set Voteopt user
    voteopt.user = user;

    // Create new Voteopt model instance
    var voteoptObj = new Voteopt(voteopt);

    // Save the Voteopt
    voteoptObj.save(function () {
      // Try deleting Voteopt
      request(app).delete('/api/voteopts/' + voteoptObj._id)
        .expect(403)
        .end(function (voteoptDeleteErr, voteoptDeleteRes) {
          // Set message assertion
          (voteoptDeleteRes.body.message).should.match('User is not authorized');

          // Handle Voteopt error error
          done(voteoptDeleteErr);
        });

    });
  });

  it('should be able to get a single Voteopt that has an orphaned user reference', function (done) {
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

          // Save a new Voteopt
          agent.post('/api/voteopts')
            .send(voteopt)
            .expect(200)
            .end(function (voteoptSaveErr, voteoptSaveRes) {
              // Handle Voteopt save error
              if (voteoptSaveErr) {
                return done(voteoptSaveErr);
              }

              // Set assertions on new Voteopt
              (voteoptSaveRes.body.name).should.equal(voteopt.name);
              should.exist(voteoptSaveRes.body.user);
              should.equal(voteoptSaveRes.body.user._id, orphanId);

              // force the Voteopt to have an orphaned user reference
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

                    // Get the Voteopt
                    agent.get('/api/voteopts/' + voteoptSaveRes.body._id)
                      .expect(200)
                      .end(function (voteoptInfoErr, voteoptInfoRes) {
                        // Handle Voteopt error
                        if (voteoptInfoErr) {
                          return done(voteoptInfoErr);
                        }

                        // Set assertions
                        (voteoptInfoRes.body._id).should.equal(voteoptSaveRes.body._id);
                        (voteoptInfoRes.body.name).should.equal(voteopt.name);
                        should.equal(voteoptInfoRes.body.user, undefined);

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
      Voteopt.remove().exec(done);
    });
  });
});
