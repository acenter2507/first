(function () {
  'use strict';

  angular
    .module(ApplicationConfiguration.applicationModuleName)
    .config(translateConfig)
    .config(toastConfig)
    .config(textAngularConfig)
    .config(loadingBarConfig)
    .config(momentPickerConfig)
    .run(runConfig);


  translateConfig.$inject = ['$translateProvider'];
  function translateConfig($translateProvider) {
    $translateProvider.useStaticFilesLoader({
      prefix: 'locale-',
      suffix: '.json'
    });
    $translateProvider
      .registerAvailableLanguageKeys(['en', 'ja', 'vi'], {
        'en': 'en',
        'ja': 'ja',
        'vi': 'vi',
        'en_US': 'en',
        'en_UK': 'en'
      });
    // Cài đặt ngôn ngữ mặc định của browser
    $translateProvider.determinePreferredLanguage();
    // Sử dụng cookie
    $translateProvider.useCookieStorage();
    // Nếu không có ngôn ngữ của user thì default là en
    $translateProvider.fallbackLanguage('en');
    // Mã hóa bảo mật
    $translateProvider.useSanitizeValueStrategy('escape');
  }

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
    $provide.decorator('taOptions', ['taRegisterTool', 'taToolFunctions', '$delegate', 'ngDialog',
      function (taRegisterTool, taToolFunctions, taOptions, ngDialog) {
        taRegisterTool('uploadImage', {
          iconclass: 'fa fa-upload',
          tooltiptext: 'Upload an image',
          onElementSelect: {
            element: 'img',
            action: taToolFunctions.imgOnSelectAction
          },
          action: function () {
            var $editor = this.$editor;
            var dialog = ngDialog.open({
              template: 'modules/core/client/views/templates/upload-image.dialog.template.html',
              controller: 'UploadImagesController',
              width: '90%',
              height: '90%',
              appendClassName: 'images-upload-dialog'
            });
            dialog.closePromise.then(function (data) {
              var paths = data.value || [];
              for (var index = 0; index < paths.length; index++) {
                var path = paths[index];
                $editor().wrapSelection('insertHtml', '<img src="' + path + '"><div><br/></div>', true);
              }
            });
          }
        });
        taOptions.toolbar = [
          ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'quote'],
          ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo'],
          ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
          ['html', 'insertImage', 'insertLink', 'insertVideo', 'uploadImage']
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

  runConfig.$inject = ['$rootScope', '$translate', 'amMoment', '$window', 'webStorage'];
  function runConfig($rootScope, $translate, amMoment, $window, webStorage) {
    $rootScope.$on('$translateChangeSuccess', () => {
      var lang = $translate.use();
      console.log('translateChangeSuccess', lang);
      // Thay đổi ngôn ngữ angular moment
      amMoment.changeLocale(lang);
      // Thay đổi local 
      var tz = $window.locales[lang];
      moment.tz.setDefault(tz);
      moment.locale(lang);
      $rootScope.$broadcast('changeLanguage', { language: lang });
      // moment(); -> Thời điểm của locale đã set
      // moment().utc() -> Thời điểm của UTC
      // moment().local(); -> Thời điểm của locale browser
    });
    // Thêm các time zone vào hệ thống
    moment.tz.add([
      'America/New_York|EST EDT EWT EPT|50 40 40 40|01010101010101010101010101010101010101010101010102301010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010|-261t0 1nX0 11B0 1nX0 11B0 1qL0 1a10 11z0 1qN0 WL0 1qN0 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1qN0 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1qN0 WL0 1qN0 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1qN0 WL0 1qN0 11z0 1o10 11z0 RB0 8x40 iv0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1qN0 WL0 1qN0 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1a10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1cN0 1cL0 1cN0 1cL0 s10 1Vz0 LB0 1BX0 1cN0 1fz0 1a10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1a10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|21e6',
      'Asia/Tokyo|JST JDT|-90 -a0|010101010|-QJH0 QL0 1lB0 13X0 1zB0 NX0 1zB0 NX0|38e6',
      'Asia/Ho_Chi_Minh|LMT PLMT +07 +08 +09|-76.E -76.u -70 -80 -90|0123423232|-2yC76.E bK00.a 1h7b6.u 5lz0 18o0 3Oq0 k5b0 aW00 BAM0|90e5'
    ]);
    // Kiểm tra user đã đăng nhập hay chưa
    if ($window.user) {
      // Cài đặt ngôn ngữ của user nếu đang khác nhau
      if ($window.user.language !== $translate.use()) {
        $translate.use($window.user.language);
      }
    } else {
      // Kiểm tra ngôn ngữ đã lưu trong local storage
      if (webStorage.local.has('851kf00aAF093402395')) {
        var lang = webStorage.local.get('851kf00aAF093402395');
        if (lang !== $translate.use()) {
          $translate.use($window.user.language);
        }
      }
    }
  }
}());
