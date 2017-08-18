(function () {
  'use strict';

  angular
    .module(ApplicationConfiguration.applicationModuleName)
    .config(toastConfig)
    .config(textAngularConfig)
    .config(loadingBarConfig)
    .config(momentPickerConfig)
    .run(runConfig);


  toastConfig.$inject = ['toastrConfig'];
  function toastConfig(toastrConfig) {
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

  textAngularConfig.$inject = ['$provide'];
  function textAngularConfig($provide) {
    $provide.decorator('taOptions', ['taRegisterTool', 'taToolFunctions', '$delegate',
      function (taRegisterTool, taToolFunctions, taOptions) {
        taRegisterTool('uploadImage', {
          iconclass: 'fa fa-upload',
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
            input.accept = 'image/*';

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

  loadingBarConfig.$inject = ['cfpLoadingBarProvider'];
  function loadingBarConfig(cfpLoadingBarProvider) {
    // Loading bar
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.latencyThreshold = 1;
  }
  momentPickerConfig.$inject = ['momentPickerProvider'];
  function momentPickerConfig(momentPickerProvider) {
    momentPickerProvider.options({
      minutesFormat: 'HH:mm'
    });
  }
  function runConfig(amMoment) {
    moment.tz.add([
      'Asia/Tokyo|JST JDT|-90 -a0|010101010|-QJH0 QL0 1lB0 13X0 1zB0 NX0 1zB0 NX0|38e6',
      'Asia/Ho_Chi_Minh|LMT PLMT +07 +08 +09|-76.E -76.u -70 -80 -90|0123423232|-2yC76.E bK00.a 1h7b6.u 5lz0 18o0 3Oq0 k5b0 aW00 BAM0|90e5'
    ]);
    moment.tz.setDefault('Asia/Tokyo');
    moment.locale('ja');
    amMoment.changeLocale('ja');
  }
}());
