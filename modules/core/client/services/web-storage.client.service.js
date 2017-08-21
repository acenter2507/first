'use strict';

// Create the Storages wrapper service
angular.module('core').service('Storages', [
  'webStorage',
  function (webStorage) {
    this.has_session = (key) => {
      return webStorage.session.has(key);
    };
    this.get_session = (key, df) => {
      if (!webStorage.session.isSupported || !webStorage.session.has(key)) {
        return df;
      }
      return webStorage.session.get(key);
    };
    this.set_session = (key, val) => {
      if (!webStorage.session.isSupported) {
        return;
      }
      webStorage.session.set(key, val);
    };
    this.remove_session = (key) => {
      if (!webStorage.session.isSupported) {
        return;
      }
      webStorage.session.remove(key);
    };
    this.has_local = (key) => {
      return webStorage.local.has(key);
    };
    this.get_local = (key, df) => {
      if (!webStorage.local.isSupported || !webStorage.local.has(key)) {
        return df;
      }
      return webStorage.local.get(key);
    };
    this.set_local = (key, val) => {
      if (!webStorage.local.isSupported) {
        return;
      }
      webStorage.local.set(key, val);
    };
    this.remove_local = (key) => {
      if (!webStorage.local.isSupported) {
        return;
      }
      webStorage.local.remove(key);
    };
    return this;
  }
]);
