import { expect } from 'chai';
import { CaseInsensitiveMap } from './case-insensitive-map';

describe('CaseInsensitiveMap', () => {
  describe('set / get', () => {
    it('should set a key-value pair in the map', () => {
      const map = new CaseInsensitiveMap<string, number>();

      map.set('KEY', 1);

      expect(map.get('key')).to.be.equal(1);
      expect(map.size).to.be.equal(1);
    });

    it('should set a key-value pair in the map with a number key', () => {
      const map = new CaseInsensitiveMap<number, number>();

      map.set(1, 2);
      expect(map.get(1)).to.be.equal(2);
      expect(map.size).to.be.equal(1);
    });
  });

  describe('has', () => {
    it('should return true if the map has the key', () => {
      const map = new CaseInsensitiveMap<string, number>();

      map.set('KEY', 1);

      expect(map.has('kEy')).to.be.true;
      expect(map.size).to.be.equal(1);
    });
  });
});
