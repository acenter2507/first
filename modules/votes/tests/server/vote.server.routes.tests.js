'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Vote = mongoose.model('Vote'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  vote;

/**
 * Vote routes tests
 */
describe('Vote CRUD tests', function () {

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

    // Save a user to the test db and create new Vote
    user.save(function () {
      vote = {
        name: 'Vote name'
      };

      done();
    });
  });

  it('should be able to save a Vote if logged in', function (done) {
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

        // Save a new Vote
        agent.post('/api/votes')
          .send(vote)
          .expect(200)
          .end(function (voteSaveErr, voteSaveRes) {
            // Handle Vote save error
            if (voteSaveErr) {
              return done(voteSaveErr);
            }

            // Get a list of Votes
            agent.get('/api/votes')
              .end(function (votesGetErr, votesGetRes) {
                // Handle Votes save error
                if (votesGetErr) {
                  return done(votesGetErr);
                }

                // Get Votes list
                var votes = votesGetRes.body;

                // Set assertions
                (votes[0].user._id).should.equal(userId);
                (votes[0].name).should.match('Vote name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Vote if not logged in', function (done) {
    agent.post('/api/votes')
      .send(vote)
      .expect(403)
      .end(function (voteSaveErr, voteSaveRes) {
        // Call the assertion callback
        done(voteSaveErr);
      });
  });

  it('should not be able to save an Vote if no name is provided', function (done) {
    // Invalidate name field
    vote.name = '';

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

        // Save a new Vote
        agent.post('/api/votes')
          .send(vote)
          .expect(400)
          .end(function (voteSaveErr, voteSaveRes) {
            // Set message assertion
            (voteSaveRes.body.message).should.match('Please fill Vote name');

            // Handle Vote save error
            done(voteSaveErr);
          });
      });
  });

  it('should be able to update an Vote if signed in', function (done) {
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

        // Save a new Vote
        agent.post('/api/votes')
          .send(vote)
          .expect(200)
          .end(function (voteSaveErr, voteSaveRes) {
            // Handle Vote save error
            if (voteSaveErr) {
              return done(voteSaveErr);
            }

            // Update Vote name
            vote.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Vote
            agent.put('/api/votes/' + voteSaveRes.body._id)
              .send(vote)
              .expect(200)
              .end(function (voteUpdateErr, voteUpdateRes) {
                // Handle Vote update error
                if (voteUpdateErr) {
                  return done(voteUpdateErr);
                }

                // Set assertions
                (voteUpdateRes.body._id).should.equal(voteSaveRes.body._id);
                (voteUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Votes if not signed in', function (done) {
    // Create new Vote model instance
    var voteObj = new Vote(vote);

    // Save the vote
    voteObj.save(function () {
      // Request Votes
      request(app).get('/api/votes')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Vote if not signed in', function (done) {
    // Create new Vote model instance
    var voteObj = new Vote(vote);

    // Save the Vote
    voteObj.save(function () {
      request(app).get('/api/votes/' + voteObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', vote.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Vote with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/votes/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Vote is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Vote which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Vote
    request(app).get('/api/votes/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Vote with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Vote if signed in', function (done) {
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

        // Save a new Vote
        agent.post('/api/votes')
          .send(vote)
          .expect(200)
          .end(function (voteSaveErr, voteSaveRes) {
            // Handle Vote save error
            if (voteSaveErr) {
              return done(voteSaveErr);
            }

            // Delete an existing Vote
            agent.delete('/api/votes/' + voteSaveRes.body._id)
              .send(vote)
              .expect(200)
              .end(function (voteDeleteErr, voteDeleteRes) {
                // Handle vote error error
                if (voteDeleteErr) {
                  return done(voteDeleteErr);
                }

                // Set assertions
                (voteDeleteRes.body._id).should.equal(voteSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Vote if not signed in', function (done) {
    // Set Vote user
    vote.user = user;

    // Create new Vote model instance
    var voteObj = new Vote(vote);

    // Save the Vote
    voteObj.save(function () {
      // Try deleting Vote
      request(app).delete('/api/votes/' + voteObj._id)
        .expect(403)
        .end(function (voteDeleteErr, voteDeleteRes) {
          // Set message assertion
          (voteDeleteRes.body.message).should.match('User is not authorized');

          // Handle Vote error error
          done(voteDeleteErr);
        });

    });
  });

  it('should be able to get a single Vote that has an orphaned user reference', function (done) {
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

          // Save a new Vote
          agent.post('/api/votes')
            .send(vote)
            .expect(200)
            .end(function (voteSaveErr, voteSaveRes) {
              // Handle Vote save error
              if (voteSaveErr) {
                return done(voteSaveErr);
              }

              // Set assertions on new Vote
              (voteSaveRes.body.name).should.equal(vote.name);
              should.exist(voteSaveRes.body.user);
              should.equal(voteSaveRes.body.user._id, orphanId);

              // force the Vote to have an orphaned user reference
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

                    // Get the Vote
                    agent.get('/api/votes/' + voteSaveRes.body._id)
                      .expect(200)
                      .end(function (voteInfoErr, voteInfoRes) {
                        // Handle Vote error
                        if (voteInfoErr) {
                          return done(voteInfoErr);
                        }

                        // Set assertions
                        (voteInfoRes.body._id).should.equal(voteSaveRes.body._id);
                        (voteInfoRes.body.name).should.equal(vote.name);
                        should.equal(voteInfoRes.body.user, undefined);

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
      Vote.remove().exec(done);
    });
  });
});
