var assert = require('assert');
const etc = require("../lib/");
describe('etc', function() {
  describe('UUID', function() {
    it('should return new UUID', function() {
      assert.notEqual(new etc.UUID(), null);
    });

    it('should be able to parse UUID string representations', function() {
      var src = "5753a025-b5ce-4aac-9bab-02d6be0885a3";
      var u = new etc.UUID(src);

      assert.equal(src, u.toString());
    });

    it('should be able to serialize to and from bytes', function() {
      var src = [242, 30, 252, 1, 31, 104, 64, 238, 143, 247, 13, 248, 9, 245, 219, 10];
      var u = new etc.UUID(src);

      assert.deepEqual(src, u.toBytes());
    });
  });
});