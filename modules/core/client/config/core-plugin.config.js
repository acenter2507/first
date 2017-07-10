'use strict';
angular.module('core').config(['toastrConfig',
  function (toastrConfig) {
    angular.extend(toastrConfig, {
      allowHtml: false,
      autoDismiss: true,
      closeButton: true,
      // containerId: 'toast-container',
      maxOpened: 5,
      newestOnTop: false,
      positionClass: 'toast-bottom-right',
      preventDuplicates: false,
      preventOpenDuplicates: false,
      target: 'body'
    });
  }
]);

angular.module('core').config(['$provide',
  function ($provide) {
    $provide.decorator('taOptions', ['taRegisterTool', '$mdDialog', '$delegate',
      function (taRegisterTool, $modal, taOptions) {
        // $delegate is the taOptions we are decorating
        // here we override the default toolbars specified in taOptions.
        taOptions.toolbar = [
          ['clear', 'h1', 'h2', 'h3'],
          ['ul', 'ol'],
          ['bold', 'italics'],
          ['insertLink', 'insertVideo']
        ];

        // Create our own insertImage button
        taRegisterTool('customInsertImage', {
          iconclass: "fa fa-picture-o",
          action: function () {
            var textAngular = this;

            // var savedSelection = rangy.saveSelection();
            // var modalInstance = $modal.open({
            //   // Put a link to your template here or whatever
            //   template: '<label>Enter the url to your image:</label><input type="text" ng-model="img.url"><button ng-click="submit()">OK</button>',
            //   size: 'sm',
            //   controller: ['$modalInstance', '$scope',
            //     function ($modalInstance, $scope) {
            //       $scope.img = {
            //         url: ''
            //       };
            //       $scope.submit = function () {
            //         $modalInstance.close($scope.img.url);
            //       };
            //     }
            //   ]
            // });

            // modalInstance.result.then(function (imgUrl) {
            //   rangy.restoreSelection(savedSelection);
            //   textAngular.$editor().wrapSelection('insertImage', imgUrl);
            // });
            return false;
          },
        });
        taRegisterTool('uploadImage', {
          buttontext: 'Select Image',
          iconclass: "fa fa-image",
          action: function (deferred, restoreSelection) {
            var self = this;
            var sel = rangy.getSelection();
            $mdDialog.show({
              templateUrl: 'uploadImagesCont.tmpl.html',
              parent: angular.element(document.body),
              //controller: textAngularUploadImage,
              clickOutsideToClose: false
            }).then(function (result) {
              sel.collapseToEnd();
              self.$editor().wrapSelection('insertImage', $rootScope.ImageResult);
              deferred.resolve();
            });
            return false;
          }
        });
        // Now add the button to the default toolbar definition
        // Note: It'll be the last button
        taOptions.toolbar[3].push('customInsertImage', 'uploadImage');
        return taOptions;
      }
    ]);
  }
]);