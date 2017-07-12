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
        // taOptions.toolbar = [
        //   ['clear', 'h1', 'h2', 'h3'],
        //   ['ul', 'ol'],
        //   ['bold', 'italics'],
        //   ['insertLink', 'insertVideo']
        // ];

        taRegisterTool('uploadImage', {
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
        taOptions.toolbar[3].push('uploadImage');
        return taOptions;
      }
    ]);
  }
]);