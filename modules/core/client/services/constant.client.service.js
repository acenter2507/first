'use strict';

// Create the Storages wrapper service
angular.module('core').service('Constants', [
  function () {
    this.storages = {
      polls: '3918250791283P32O273LL',
      activitys: '9123881758910274823',
      admin_polls_condition: '132LFJALSF92843',
      admin_polls_fitler: '9183kfksjdf38392',
      public_search_condition: '192783hf9283492834',
      preferences: '9218391509124jkd8324',
    };
    this.defaultProfileImageURL = 'modules/users/client/img/profile/default.png';
    return this;
  }
]);
