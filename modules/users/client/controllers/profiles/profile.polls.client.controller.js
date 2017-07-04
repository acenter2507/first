'use strict';

angular.module('users').controller('ProfilePollsController', [
  '$scope',
  '$http',
  '$location',
  'Users',
  'Authentication',
  'UserApi',
  function ($scope, $http, $location, Users, Authentication,UserApi) {
    $scope.polls = [];
    // $scope.isCurrentOwner = profile._id === Authentication.user._id;
    // $scope.isLogged = (Authentication.user) ? true : false;
    // $scope.page = 0;
    console.log($scope.profile);
    // init();

    // function init() {
    //   get_polls();
    // }

    // function get_polls() {
    //   UserApi.get_polls($scope.profile._id, $scope.page)
    //     .success(res => {
    //       $scope.polls = res || [];
    //     })
    //     .error(err => {
    //       alert(err);
    //     });
    // }

    // $scope.poll_filter = (poll) => {
    //   if (poll.isPublic) {
    //     return true;
    //   } else {
    //     return $scope.isCurrentOwner;
    //   }
    // };
  }
]);
