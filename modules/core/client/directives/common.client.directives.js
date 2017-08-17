'use strict';
angular
  .module('core')
  .directive('a', preventClickDirective)
  .directive('a', cardExpandDirective)
  .directive('a', asideMenuToggleDirective)
  .directive('body', asideMenuHideDirective)
  .directive('backToTop', backToTopDirective)
  .directive('button', asidePanelToggleDirective);

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

//LayoutToggle
asideMenuToggleDirective.$inject = ['$interval'];
function asideMenuToggleDirective($interval) {
  var directive = {
    restrict: 'E',
    link: link
  };
  return directive;

  function link(scope, element, attrs) {
    element.on('click', function (e) {
      if (element.hasClass('aside-menu-toggler')) {
        angular.element('body').toggleClass('aside-menu-show');
      }
    });
  }
}
function asideMenuHideDirective() {
  var directive = {
    restrict: 'E',
    link: link
  };
  return directive;

  function link(scope, element, attrs) {
    $(document).bind("mouseup touchend", function (e) {
      var container = $("#aside-menu");
      var btn = $("#aside-menu-toggler");
      if (!container.is(e.target) && container.has(e.target).length === 0 && !btn.is(e.target) && btn.has(e.target).length === 0) {
        if ($(element).hasClass('aside-menu-show')) {
          $(element).removeClass('aside-menu-show');
        }
      }
    });
  }
}
function backToTopDirective() {
  var directive = {
    restrict: 'E',
    replace: true,
    template: '<button class="md-fab md-button md-ink-ripple back-to-top"><i class="icon-arrow-up"></i></button>',
    link: link
  };
  return directive;

  function link(scope, element, attrs) {
    $(window).scroll(function () {
      if ($(window).scrollTop() <= 0) {
        $(element).fadeOut();
      }
      else {
        $(element).fadeIn();
      }
    });
    $(element).on('click', function () {
      $('html, body').animate({ scrollTop: 0 }, 'fast');
    });
  }
}
function backToTopDirective() {
  var directive = {
    restrict: 'E',
    link: link
  };
  return directive;

  function link(scope, element, attrs) {
    element.on('click', function (e) {
      if (element.hasClass('aside-panel-toggle')) {
        angular.element('body').toggleClass('aside-menu-open');
      }
    });
  }
}