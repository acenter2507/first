(function() {
  'use strict';

  // Tags controller
  angular
    .module('tags')
    .controller('AutocompleteTagController', AutocompleteTagController);

  AutocompleteTagController.$inject = ['$scope', '$http', 'TagsService'];

  function AutocompleteTagController($scope, $http, Tags) {
    $scope.loadTags = function(query) {
      return Tags.query().$promise;
    };
    $scope.placeholder = 'Type your tags';
  }
}());
