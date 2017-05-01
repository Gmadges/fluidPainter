var assert = require('chai').assert;
var fs = require('fs');
const resolve = require('path').resolve;

eval(fs.readFileSync(resolve('./app/inputController.js')).toString());
eval(fs.readFileSync(resolve('./app/undo.js')).toString());

describe('Vec2', function() {
  
  describe('initialise', function() {
    it('should return correct values', function() {
      var testVec = new vec2(10, 5);
      assert.equal(10, testVec.x);
      assert.equal(5, testVec.y);
    });
  });

  describe('length', function() {
    it('should return correct values', function() {
      var testVec = new vec2(3, 4);
      assert.equal(5, testVec.length());
    });
  });

  describe('distance', function() {
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
    undo = new Undo([{val:0},{val:0},{val:0},{val:0},{val:0}]);
  });
  
  describe('initialise', function() {
    it('initialise values to be correct', function() {
      assert.strictEqual(0, undo.getIndex());
      assert.strictEqual(4, undo.MaxUndoAmount());

      // nothing has been stored. so we shouldnt be able to perform these actions
      assert.typeOf(undo.undo(), 'null', 'undo returns null');
      assert.typeOf(undo.redo(), 'null', 'redo returns null');

      assert.throws( function() {
        var test = new Undo([{val:0}]);
      }, Error, "Data array too small!");
    });
  });

  describe('storing', function() {
    describe('index', function() {
      it('check index after storage', function() {
        
        var item = undo.getItemToStoreTo();
        // we stored numbers so we'd expect them here
        assert.typeOf(item.val, 'number');
        assert.strictEqual(0, item.val);
        assert.strictEqual(1, undo.getIndex());

        undo.getItemToStoreTo();
        undo.getItemToStoreTo();

        assert.strictEqual(3, undo.getIndex());
        undo.getItemToStoreTo();
        assert.strictEqual(4, undo.getIndex());
        undo.getItemToStoreTo();
        assert.strictEqual(4, undo.getIndex());
      });
    });

    describe('item', function() {
      it('correct index after storage methods', function() {

        // should be full of zeros
        assert.strictEqual(0, undo.getItemToStoreTo().val);
        assert.strictEqual(0, undo.getItemToStoreTo().val);
        assert.strictEqual(0, undo.getItemToStoreTo().val);
        assert.strictEqual(0, undo.getItemToStoreTo().val);

        // now should be full of numbers
        var item1 = undo.getItemToStoreTo();
        item1.val = 1;
        var item2 = undo.getItemToStoreTo();
        item2.val = 2;
        var item3 = undo.getItemToStoreTo();
        item3.val = 3;
        var item4 = undo.getItemToStoreTo();
        item4.val = 4;

        // next item to overwrite will be the last in the pack which should be 1 etc
        assert.strictEqual(1, undo.getItemToStoreTo().val);
        assert.strictEqual(2, undo.getItemToStoreTo().val);
        assert.strictEqual(3, undo.getItemToStoreTo().val);
        assert.strictEqual(4, undo.getItemToStoreTo().val);
      });
    });
  });

  describe('undo', function() { 
    describe('basic', function() {
      it('should return correct values after some basic undo ops', function() {
        var item1 = undo.getItemToStoreTo();
        item1.val = 5;
        var item2 = undo.getItemToStoreTo();
        item2.val = 4;

        assert.equal(4, undo.undo().val);
        assert.equal(1, undo.getIndex());
      });
    });

    describe('advanced 1', function() {
      it('should return correct values after some undo ops', function() {
        var item1 = undo.getItemToStoreTo();
        item1.val = 5;
        var item2 = undo.getItemToStoreTo();
        item2.val = 4;

        undo.undo();
        undo.undo();
        var item = undo.undo();
        // 3 undos should still return 5, its the oldest value we have
        assert.equal(5, item.val);
        assert.equal(0, undo.getIndex());
      });
    });

    describe('advanced 2', function() {
      it('should return correct values after some undo ops', function() {
        var item1 = undo.getItemToStoreTo();
        item1.val = 5;
        var item2 = undo.getItemToStoreTo();
        item2.val = 4;

        var item = undo.undo();
        assert.equal(4, item.val);
        assert.equal(1, undo.getIndex());
      });
    });

    describe('advanced 3', function() {
      it('should return correct values after some undo ops', function() {
        var item1 = undo.getItemToStoreTo();
        item1.val = 5;
        var item2 = undo.getItemToStoreTo();
        item2.val = 4;

        undo.undo();
        var item3 = undo.getItemToStoreTo();
        item3.val = 3;


        assert.equal(3, undo.undo().val);
        assert.equal(5, undo.undo().val);
      });
    });
  });

  describe('redo basic ', function() { 
    describe('redo basic ', function() {
      it('should return correct values after some redo ops', function() {
        var item1 = undo.getItemToStoreTo();
        item1.val = 5;
        var item2 = undo.getItemToStoreTo();
        item2.val = 4;

        // shouldnt be able to redo unless we have undone
        assert.equal(null, undo.redo());
        assert.equal(false, undo.isRedoEnabled());

        assert.equal(4, undo.undo().val);
        assert.equal(5, undo.undo().val);

        // this will be null because we never set the current item.
        assert.equal(null, undo.redo());
      });
    });

    describe('redo basic ', function() {
      it('should return correct values after some redo ops', function() {
        var item1 = undo.getItemToStoreTo();
        item1.val = 5;
        var item2 = undo.getItemToStoreTo();
        item2.val = 4;

        var item = undo.getCurrentItemToStore();
        item.val = 7;

        assert.equal(4, undo.undo().val);

        assert.equal(7, undo.redo().val);
        assert.equal(7, undo.redo().val);
        assert.equal(7, undo.redo().val);
      });
    });

    describe('redo advanced 1 ', function() {
      it('should return correct values after some redo ops', function() {
        var item1 = undo.getItemToStoreTo();
        item1.val = 5;
        var item2 = undo.getItemToStoreTo();
        item2.val = 4;

        undo.undo();
        var item = undo.getItemToStoreTo();
        item.val = 3;

        assert.equal(null, undo.redo());
      });
    });

    describe('redo advanced 2 ', function() {
      it('should return correct values after some redo ops', function() {
        var item1 = undo.getItemToStoreTo();
        item1.val = 5;
        var item2 = undo.getItemToStoreTo();
        item2.val = 4;

        var item = undo.getCurrentItemToStore();
        item.val = 7;
        
        undo.undo();
        undo.undo();

        assert.equal(4, undo.redo().val);
      });
    });
  });

  describe('common usage', function() {

    describe('pattern 1', function() {
        it('should pass these tests of standard usage', function() {
          
        // store two items
        var item1 = undo.getItemToStoreTo();
        item1.val = 37;
        var item2 = undo.getItemToStoreTo();
        item2.val = 24;

        // snapshot current item
        var item3 = undo.getCurrentItemToStore();
        item3.val = 7;

        // undo
        undo.undo();

        // second undo
        assert.equal(37, undo.undo().val);
        // spam the redo
        assert.equal(24, undo.redo().val);
        assert.equal(7, undo.redo().val);
        assert.equal(7, undo.redo().val);
      });
    });

    describe('pattern 2', function() {
        it('should pass these tests of standard usage', function() {
          
        // store two items
        var item1 = undo.getItemToStoreTo();
        item1.val = 37;
        var item2 = undo.getItemToStoreTo();
        item2.val = 24;
        var item3 = undo.getItemToStoreTo();
        item3.val = 50;
        var item4 = undo.getItemToStoreTo();
        item4.val = 96;
        var item5 = undo.getItemToStoreTo();
        item5.val = 34;
        var item6 = undo.getItemToStoreTo();
        item6.val = 93;
        var item7 = undo.getItemToStoreTo();
        item7.val = 1;

        // redo shouldnt work
        assert.equal(null, undo.redo());
        
        // snapshot current item
        var item8 = undo.getCurrentItemToStore();
        item8.val = 12;

        // spam undo
        assert.equal(1, undo.undo().val);
        assert.equal(93, undo.undo().val);
        assert.equal(34, undo.undo().val);
        assert.equal(93, undo.redo().val);
        assert.equal(34, undo.undo().val);
        assert.equal(96, undo.undo().val);
        assert.equal(96, undo.undo().val);
      });
    });
    // todo could add more tests
  });
});