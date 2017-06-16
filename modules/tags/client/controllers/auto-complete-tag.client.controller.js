(function() {
  'use strict';

  // Tags controller
  angular
    .module('tags')
    .controller('AutocompleteTagController', AutocompleteTagController);

  AutocompleteTagController.$inject = ['$scope', '$http', '$q', 'TagsService'];

  function AutocompleteTagController($scope, $http, Tags) {
    $scope.tags = Tags.query();

    $scope.loadItems = function(query) {
      var items, deferred = $q.defer();
      items = _.chain($scope.tags),filter((obj) => {
        return obj.name.toLowerCase().indexOf(query.toLowerCase()) > -1;
      })
      .take(10)
      .value();
      deferred.resolve(items);
      return deferred.promise;
    };
    $scope.placeholder = 'Type your tags';
  }
}());
