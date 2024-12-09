import { expect } from 'chai';
import { NestedRecord } from './nested-record';

describe('NestedRecord', () => {
  describe('constructor', () => {
    it('should create a new instance of the class', () => {
      const record = new NestedRecord();

      expect(record).to.be.instanceof(NestedRecord);
      expect(record).to.have.property('record').to.deep.equal({});
    });

    it('should create a new instance of the class with a record', () => {
      const record = new NestedRecord({ key: 'value' });

      expect(record).to.be.instanceof(NestedRecord);
      expect(record).to.have.property('record').to.deep.equal({ key: 'value' });
    });

    it('should create a new instance of the class with a record with lowercase keys', () => {
      const record = new NestedRecord({ a: { B: 'c' } });

      expect(record).to.be.instanceof(NestedRecord);
      expect(record)
        .to.have.property('record')
        .to.deep.equal({ a: { b: 'c' } });
    });

    it('should create a new instance of the class with a record with lowercase keys and number keys', () => {
      const record = new NestedRecord({ 1: { B: 'c' } });

      expect(record).to.be.instanceof(NestedRecord);
      expect(record)
        .to.have.property('record')
        .to.deep.equal({ 1: { b: 'c' } });
    });
  });

  describe('get', () => {
    it('should return a value from the record', () => {
      const record = new NestedRecord({ a: { b: 'c' } });

      expect(record.get('a', 'b')).to.equal('c');
    });

    it('should return a value from the record case insensitive', () => {
      const record = new NestedRecord({ a: { b: 'c' } });

      expect(record.get('A', 'B')).to.equal('c');
    });

    it('should return a value from the record case insensitive and number keys', () => {
      const record = new NestedRecord({ a: { b: { 3: 'c' } } });

      expect(record.get('A', 'B', 3)).to.equal('c');
    });
  });

  describe('set', () => {
    it('should set a value in the record', () => {
      const record = new NestedRecord();

      record.set({ path: ['a', 'b'], value: 'c' });

      expect(record.record).to.deep.equal({ a: { b: 'c' } });
    });

    it('should set a value in the record case insensitive', () => {
      const record = new NestedRecord();

      record.set({ path: ['A', 'B'], value: 'c' });

      expect(record.record).to.deep.equal({ a: { b: 'c' } });
    });

    it('should set a value in the record case insensitive and number keys', () => {
      const record = new NestedRecord();

      record.set({ path: ['A', 'B', 3], value: 'c' });

      expect(record.record).to.deep.equal({ a: { b: { 3: 'c' } } });
    });
  });
});
