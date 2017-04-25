var assert = require('assert');
var fs = require('fs');
const resolve = require('path').resolve;

eval(fs.readFileSync(resolve('./app/inputController.js')).toString());

describe('Vec2', function() {
  
  describe('#initialise', function() {
    it('should return correct values', function() {
      var testVec = new vec2(10, 5);
      assert.equal(10, testVec.x);
      assert.equal(5, testVec.y);
    });
  });

  describe('#length', function() {
    it('should return correct values', function() {
      var testVec = new vec2(3, 4);
      assert.equal(5, testVec.length());
    });
  });

  describe('#distance', function() {
    it('should return correct values', function() {
      var posA = new vec2(56, 74);
      var posB = new vec2(32, 128);
      var dist = posA.distance(posB);

      assert.equal(24, dist.x);
      assert.equal(-54, dist.y);
    });
  });
});