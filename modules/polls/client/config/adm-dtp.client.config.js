(function () {
  'use strict';

  angular
    .module('polls')
    .config(dtpConfig);

  dtpConfig.$inject = ['ADMdtpProvider'];

  function dtpConfig(ADMdtp) {
    ADMdtp.setOptions({
        calType: 'gregorian',
        format: 'YYYY/MM/DD hh:mm'
    });
  }
}());