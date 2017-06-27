(function() {
  'use strict';
  // Làm cho text tự cắt chiều dài hợp với div
  angular
    .module('polls')
    // Chuyển đổi nội dung comment giữ nguyên line break
    .filter('nl2br', function($sce) {
      return function(msg, is_xhtml) {
        var is_xhtml = is_xhtml || true;
        var breakTag = is_xhtml ? '<br />' : '<br>';
        var msg = (msg + '').replace(
          /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
          '$1' + breakTag + '$2'
        );
        return $sce.trustAsHtml(msg);
      };
    });
})();
