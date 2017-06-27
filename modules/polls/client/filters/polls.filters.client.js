(function() {
  'use strict';
  // Làm cho text tự cắt chiều dài hợp với div
  angular
    .module('polls')
    .filter('splice', function() {
      return function(value, max, tail) {
        if (!value) return '';
        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;
        value = value.substr(0, max);
        return value + (tail || ' …');
      };
    })
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
