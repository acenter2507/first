'use strict';

describe('Views E2E Tests:', function () {
  describe('Test Views page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/views');
      expect(element.all(by.repeater('view in views')).count()).toEqual(0);
    });
  });
});
