'use strict';

describe('Tags E2E Tests:', function () {
  describe('Test Tags page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/tags');
      expect(element.all(by.repeater('tag in tags')).count()).toEqual(0);
    });
  });
});
