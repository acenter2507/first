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
    $provide.decorator('taOptions', ['taRegisterTool', 'taToolFunctions', 'ngDialog', '$delegate',
      function (taRegisterTool, taToolFunctions, dialog, taOptions) {
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
            dialog.openConfirm({
              // controller: 'PollInputController',
              templateUrl: 'modules/core/client/views/templates/confirm.dialog.template.html'
            }).then(confirm => {
              alert(1);
            }, reject => {
            });
            console.log('Clicked');
            // $mdDialog.show({
            //   templateUrl: 'uploadImagesCont.tmpl.html',
            //   parent: angular.element(document.body),
            //   //controller: textAngularUploadImage,
            //   clickOutsideToClose: false
            // }).then(function (result) {
            //   sel.collapseToEnd();
            //   self.$editor().wrapSelection('insertImage', $rootScope.ImageResult);
            //   deferred.resolve();
            // });
            return false;
          }
        });
        taRegisterTool('uploadImage2', {
        iconclass: "fa fa-picture-o",
        tooltiptext: 'Upload an image',
        onElementSelect: {
          element: 'img',
          action: taToolFunctions.imgOnSelectAction
        },
        action: function() {
          var $editor = this.$editor;

          // Create a virtual input element.
          var input = document.createElement('input');
          input.type = 'file';
          input.accept = "image/*";

          input.onchange = function() {
            var reader = new FileReader();

            if (this.files && this.files[0]) {
              reader.onload = function(e) {
                $editor().wrapSelection('insertHtml', '<img src=' + e.target.result + '>', true);
              };

              reader.readAsDataURL(this.files[0]);
            }
          };

          // Click on a virtual input element.
          input.click();
        }
      });
        taOptions.toolbar[3].push('customInsertImage', 'uploadImage', 'uploadImage2');
        return taOptions;
      }
    ]);
  }
]);