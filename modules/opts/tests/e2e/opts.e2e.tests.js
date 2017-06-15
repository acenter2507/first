'use strict';

describe('Opts E2E Tests:', function () {
  describe('Test Opts page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/opts');
      expect(element.all(by.repeater('opt in opts')).count()).toEqual(0);
    });
  });
});
