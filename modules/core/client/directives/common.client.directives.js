'use strict';
angular
  .module('core')
  // .directive('a', preventClickDirective)
  .directive('a', cardExpandDirective);

//Prevent click if href="#"
function preventClickDirective() {
  var directive = {
    restrict: 'E',
    link: link
  };
  return directive;

  function link(scope, element, attrs) {
    if (attrs.href === '#') {
      element.on('click', function (event) {
        event.preventDefault();
      });
    }
  }
}

//Card Collapse
function cardExpandDirective() {
  var directive = {
    restrict: 'E',
    link: link
  };
  return directive;

  function link(scope, element, attrs) {
    element.on('click', function () {
      if (element.hasClass('card-expand-toggle')) {
        element.find('i').toggleClass('r180');
        element.parent().parent().toggleClass('open');
      }
      // 
    });
  }
}
