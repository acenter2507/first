'use strict';

describe('Bookmarks E2E Tests:', function () {
  describe('Test Bookmarks page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/bookmarks');
      expect(element.all(by.repeater('bookmark in bookmarks')).count()).toEqual(0);
    });
  });
});
