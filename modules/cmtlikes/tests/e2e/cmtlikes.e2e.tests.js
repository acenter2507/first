'use strict';

describe('Cmtlikes E2E Tests:', function () {
  describe('Test Cmtlikes page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/cmtlikes');
      expect(element.all(by.repeater('cmtlike in cmtlikes')).count()).toEqual(0);
    });
  });
});
