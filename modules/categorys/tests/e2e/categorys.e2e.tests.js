'use strict';

describe('Categorys E2E Tests:', function () {
  describe('Test Categorys page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/categorys');
      expect(element.all(by.repeater('category in categorys')).count()).toEqual(0);
    });
  });
});
