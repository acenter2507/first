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
    $provide.decorator('taOptions', ['taRegisterTool', 'taToolFunctions', '$delegate',
      function (taRegisterTool, taToolFunctions, taOptions) {
        taRegisterTool('uploadImage', {
          iconclass: "fa fa-upload",
          tooltiptext: 'Upload an image',
          onElementSelect: {
            element: 'img',
            action: taToolFunctions.imgOnSelectAction
          },
          action: function () {
            var $editor = this.$editor;

            // Create a virtual input element.
            var input = document.createElement('input');
            input.type = 'file';
            input.accept = "image/*";

            input.onchange = function () {
              var reader = new FileReader();

              if (this.files && this.files[0]) {
                reader.onload = function (e) {
                  $editor().wrapSelection('insertHtml', '<img src=' + e.target.result + '><div><br/></div>', true);
                };
                reader.readAsDataURL(this.files[0]);
              }
            };
            // Click on a virtual input element.
            input.click();
          }
        });
        taOptions.toolbar = [
          ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
          ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
          ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
          ['html', 'insertImage', 'insertLink', 'insertVideo', 'uploadImage', 'wordcount', 'charcount']
        ];
        // taOptions.toolbar[3].push('uploadImage');
        return taOptions;
      }
    ]);
  }
]);