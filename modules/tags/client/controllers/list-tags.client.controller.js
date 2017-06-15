(function () {
  'use strict';

  angular
    .module('tags')
    .controller('TagsListController', TagsListController);

  TagsListController.$inject = ['TagsService'];

  function TagsListController(TagsService) {
    var vm = this;

    vm.tags = TagsService.query();
  }
}());
