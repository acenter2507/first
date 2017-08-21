(function () {
  'use strict';

  angular
    .module('tags.admin')
    .controller('AdminTagsListController', AdminTagsListController);

  AdminTagsListController.$inject = [
    '$scope',
    '$state',
    '$window',
    '$filter',
    'TagsService',
    'Authentication',
    'toastr',
    'FileUploader'
  ];

  function AdminTagsListController(
    $scope,
    $state,
    $window,
    $filter,
    TagsService,
    Authentication,
    toast,
    FileUploader
  ) {
    var vm = this;
    if (!$scope.isAdmin) {
      $state.go('home');
    }

    var promise = TagsService.query().$promise;
    promise.then(_tags => {
      vm.tags = _tags || [];
    });

    TagsService.query().$promise
      .then(tags => {
        vm.tags = tags;
        buildPage();
      });
    function buildPage() {
      vm.searchKey = '';
      vm.shows = [];
      search();
    }
    vm.search = search;
    function search() {
      vm.shows = $filter('filter')(vm.tags, {
        $: vm.searchKey
      });
    }
    $scope.uploader = new FileUploader();
    $scope.uploader.onAfterAddingAll = function (addedFileItems) {
      var file = addedFileItems[0]._file;
      var reader = new FileReader();
      reader.onload = function (progressEvent) {
        // By lines
        var rs_tag;
        var lines = this.result.split('\n').map(function (item) {
          return item.trim().toLowerCase();
        });
        for (var line = 0; line < lines.length; line++) {
          rs_tag = new TagsService({ name: lines[line] });
          rs_tag.$save(res => {
            console.log(res);
          });
        }

      };
      reader.readAsText(file);
    };
    vm.import = () => {
      angular.element('#importFile').click();
    };

    // function readFile = ele => {
    //   var file = ele.files[0];
    //   var reader = new FileReader();
    //   reader.onload = function (progressEvent) {
    //     // By lines
    //     var rs_tag;
    //     var lines = this.result.split('\n');
    //     for (var line = 0; line < lines.length; line++) {
    //       rs_tag = new TagsService({ name: line.trim().toLowerCase() });
    //       rs_tag.$save(res => {
    //         vm.tags.push(res);
    //       });
    //     }

    //   };
    //   reader.readAsText(file);
    // };
    $scope.remove = tag => {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.tags = _.without(vm.tags, tag);
        search();
        tag.$remove();
      }
    };

  }
}());
