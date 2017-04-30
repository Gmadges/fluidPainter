var assert = require('assert');
var fs = require('fs');
const resolve = require('path').resolve;

eval(fs.readFileSync(resolve('./app/inputController.js')).toString());
eval(fs.readFileSync(resolve('./app/undo.js')).toString());

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


describe('UndoBuffers', function() {

  var undo;

  beforeEach(function() {
    undo = new Undo([0,0,0,0,0]);
  });
  
  describe('#initialise', function() {
    it('initialise values to be correct', function() {
      assert.equal(0, undo.getCurrentIndex());
      assert.equal(5, undo.getMaxQueueSize());

      // nothing has been stored. so we shouldnt be able to perform these actions
      assert.equal(null , undo.undo());
      assert.equal(null , undo.redo());
    });
  });

  describe('#storing index', function() {
    it('correct index after storage methods', function() {
      undo.getItemToStoreTo() = 5;
      undo.getItemToStoreTo() = 4;
      undo.getItemToStoreTo() = 3;
      undo.getItemToStoreTo() = 2;

      assert.equal(3, undo.getCurrentIndex());
      
      undo.getItemToStoreTo() = 1;
      undo.getItemToStoreTo() = 0;

      assert.equal(4, undo.getCurrentIndex());
    });
  });

  describe('#storing item', function() {
    it('correct index after storage methods', function() {

      // should be full of zeros
      assert.equal(0, undo.getItemToStoreTo());
      assert.equal(0, undo.getItemToStoreTo());
      assert.equal(0, undo.getItemToStoreTo());
      assert.equal(0, undo.getItemToStoreTo());
      assert.equal(0, undo.getItemToStoreTo());

      // now should be full of numbers
      undo.getItemToStoreTo() = 1;
      undo.getItemToStoreTo() = 2;
      undo.getItemToStoreTo() = 3;
      undo.getItemToStoreTo() = 4;
      undo.getItemToStoreTo() = 5;

      // next item to overwrite will be the last in the pack which should be 1
      assert.equal(1, undo.getItemToStoreTo());
    });
  });

  describe('#undo basic', function() {
    it('should return correct values after some basic undo ops', function() {
      undo.getItemToStoreTo() = 5;
      undo.getItemToStoreTo() = 4;

      var item = undo.undo();
      assert.equal(4, item);
      assert.equal(1, undo.getCurrentIndex());
    });
  });

  describe('#undo advanced', function() {
    it('should return correct values after some undo ops', function() {
      undo.getItemToStoreTo() = 5;
      undo.getItemToStoreTo() = 4;

      undo.undo();
      undo.undo();
      var item = undo.undo();
      // 3 undos should still return 5, its the oldest value we have
      assert.equal(5, item);
      assert.equal(0, undo.getCurrentIndex());
    });
  });

  describe('#undo advanced 1', function() {
    it('should return correct values after some undo ops', function() {
      undo.getItemToStoreTo() = 5;
      undo.getItemToStoreTo() = 4;

      var item = undo.undo();
      assert.equal(4, item);
      assert.equal(1, undo.getCurrentIndex());
    });
  });

  describe('#undo advanced 2', function() {
    it('should return correct values after some undo ops', function() {
      undo.getItemToStoreTo() = 5;
      undo.getItemToStoreTo() = 4;

      undo.undo();
      undo.getItemToStoreTo() = 3;

      assert.equal(3, undo.undo());
      assert.equal(5, undo.undo());
    });
  });

  describe('#redo basic ', function() {
    it('should return correct values after some redo ops', function() {
      undo.getItemToStoreTo() = 5;
      undo.getItemToStoreTo() = 4;

      // shouldnt be able to redo unless we have undone
      assert.equal(null, undo.redo());

      undo.undo();
      var item = undo.redo();
      assert.equal(4, item);
      assert.equal(1, undo.getCurrentIndex());
    });
  });

  describe('#redo advanced 1 ', function() {
    it('should return correct values after some redo ops', function() {
      undo.getItemToStoreTo() = 5;
      undo.getItemToStoreTo() = 4;

      undo.undo();
      undo.getItemToStoreTo() = 3;

      assert.equal(null, undo.redo());
    });
  });

// todo MORE test

});