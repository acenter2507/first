'use strict';

// Create the Socket.io wrapper service
angular.module('core').service('Socket', [
  'Authentication',
  '$timeout',
  'socketFactory',
  '$location',
  function(Authentication, $timeout, socketFactory, $location) {
    // Connect to Socket.io server
    this.connect = function() {
      var protocol = $location.protocol();
      var host = $location.host();
      var port = $location.port();
      var url = protocol + '://' + host + (port !== '') ? ':' + port : '';
      console.log(url);
      this.socket = socketFactory();
      if (Authentication.user) {
        this.socket.emit('init', { user: Authentication.user._id });
      } else {
        this.socket.emit('guest');
      }
    };
    this.connect();

    // Wrap the Socket.io 'on' method
    this.on = function(eventName, callback) {
      if (this.socket) {
        this.socket.on(eventName, function(data) {
          $timeout(function() {
            callback(data);
          });
        });
      }
    };

    // Wrap the Socket.io 'emit' method
    this.emit = function(eventName, data) {
      if (this.socket) {
        this.socket.emit(eventName, data);
      }
    };

    // Wrap the Socket.io 'removeListener' method
    this.removeListener = function(eventName) {
      if (this.socket) {
        this.socket.removeListener(eventName);
      }
    };
  }
]);
