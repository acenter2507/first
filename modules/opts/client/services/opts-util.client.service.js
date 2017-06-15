// Opts service used to communicate Opts REST endpoints
(function () {
  'use strict';

  angular
    .module('opts')
    .factory('OptsUtil', OptsUtil);

  OptsUtil.$inject = [];

  function OptsUtil() {
    return {
    	get_poll_by_id: (polls, id) => {
    		angular.forEach(polls, (obj, key) => {
    			if (obj._id.toString() === id) {
    				return obj;
    			}
    		});
    		return null;
    	}
    };
  }
}());