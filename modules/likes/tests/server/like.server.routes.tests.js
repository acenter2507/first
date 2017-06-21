'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Like = mongoose.model('Like'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  like;

/**
 * Like routes tests
 */
describe('Like CRUD tests', function () {

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

    // Save a user to the test db and create new Like
    user.save(function () {
      like = {
        name: 'Like name'
      };

      done();
    });
  });

  it('should be able to save a Like if logged in', function (done) {
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

        // Save a new Like
        agent.post('/api/likes')
          .send(like)
          .expect(200)
          .end(function (likeSaveErr, likeSaveRes) {
            // Handle Like save error
            if (likeSaveErr) {
              return done(likeSaveErr);
            }

            // Get a list of Likes
            agent.get('/api/likes')
              .end(function (likesGetErr, likesGetRes) {
                // Handle Likes save error
                if (likesGetErr) {
                  return done(likesGetErr);
                }

                // Get Likes list
                var likes = likesGetRes.body;

                // Set assertions
                (likes[0].user._id).should.equal(userId);
                (likes[0].name).should.match('Like name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Like if not logged in', function (done) {
    agent.post('/api/likes')
      .send(like)
      .expect(403)
      .end(function (likeSaveErr, likeSaveRes) {
        // Call the assertion callback
        done(likeSaveErr);
      });
  });

  it('should not be able to save an Like if no name is provided', function (done) {
    // Invalidate name field
    like.name = '';

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

        // Save a new Like
        agent.post('/api/likes')
          .send(like)
          .expect(400)
          .end(function (likeSaveErr, likeSaveRes) {
            // Set message assertion
            (likeSaveRes.body.message).should.match('Please fill Like name');

            // Handle Like save error
            done(likeSaveErr);
          });
      });
  });

  it('should be able to update an Like if signed in', function (done) {
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

        // Save a new Like
        agent.post('/api/likes')
          .send(like)
          .expect(200)
          .end(function (likeSaveErr, likeSaveRes) {
            // Handle Like save error
            if (likeSaveErr) {
              return done(likeSaveErr);
            }

            // Update Like name
            like.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Like
            agent.put('/api/likes/' + likeSaveRes.body._id)
              .send(like)
              .expect(200)
              .end(function (likeUpdateErr, likeUpdateRes) {
                // Handle Like update error
                if (likeUpdateErr) {
                  return done(likeUpdateErr);
                }

                // Set assertions
                (likeUpdateRes.body._id).should.equal(likeSaveRes.body._id);
                (likeUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Likes if not signed in', function (done) {
    // Create new Like model instance
    var likeObj = new Like(like);

    // Save the like
    likeObj.save(function () {
      // Request Likes
      request(app).get('/api/likes')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Like if not signed in', function (done) {
    // Create new Like model instance
    var likeObj = new Like(like);

    // Save the Like
    likeObj.save(function () {
      request(app).get('/api/likes/' + likeObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', like.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Like with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/likes/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Like is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Like which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Like
    request(app).get('/api/likes/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Like with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Like if signed in', function (done) {
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

        // Save a new Like
        agent.post('/api/likes')
          .send(like)
          .expect(200)
          .end(function (likeSaveErr, likeSaveRes) {
            // Handle Like save error
            if (likeSaveErr) {
              return done(likeSaveErr);
            }

            // Delete an existing Like
            agent.delete('/api/likes/' + likeSaveRes.body._id)
              .send(like)
              .expect(200)
              .end(function (likeDeleteErr, likeDeleteRes) {
                // Handle like error error
                if (likeDeleteErr) {
                  return done(likeDeleteErr);
                }

                // Set assertions
                (likeDeleteRes.body._id).should.equal(likeSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Like if not signed in', function (done) {
    // Set Like user
    like.user = user;

    // Create new Like model instance
    var likeObj = new Like(like);

    // Save the Like
    likeObj.save(function () {
      // Try deleting Like
      request(app).delete('/api/likes/' + likeObj._id)
        .expect(403)
        .end(function (likeDeleteErr, likeDeleteRes) {
          // Set message assertion
          (likeDeleteRes.body.message).should.match('User is not authorized');

          // Handle Like error error
          done(likeDeleteErr);
        });

    });
  });

  it('should be able to get a single Like that has an orphaned user reference', function (done) {
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

          // Save a new Like
          agent.post('/api/likes')
            .send(like)
            .expect(200)
            .end(function (likeSaveErr, likeSaveRes) {
              // Handle Like save error
              if (likeSaveErr) {
                return done(likeSaveErr);
              }

              // Set assertions on new Like
              (likeSaveRes.body.name).should.equal(like.name);
              should.exist(likeSaveRes.body.user);
              should.equal(likeSaveRes.body.user._id, orphanId);

              // force the Like to have an orphaned user reference
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

                    // Get the Like
                    agent.get('/api/likes/' + likeSaveRes.body._id)
                      .expect(200)
                      .end(function (likeInfoErr, likeInfoRes) {
                        // Handle Like error
                        if (likeInfoErr) {
                          return done(likeInfoErr);
                        }

                        // Set assertions
                        (likeInfoRes.body._id).should.equal(likeSaveRes.body._id);
                        (likeInfoRes.body.name).should.equal(like.name);
                        should.equal(likeInfoRes.body.user, undefined);

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
      Like.remove().exec(done);
    });
  });
});
