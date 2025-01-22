import { expect } from 'chai';
import { isDateString, isDateTimeString, isTimeString } from './date-time-utils';

describe('isDateString', () => {
  describe('returns true', () => {
    it('scenario 1', () => {
      expect(isDateString('2021-01-01')).to.be.true;
    });

    it('scenario 2', () => {
      expect(isDateString('2021-01-01T11:00:00')).to.be.true;
    });

    it('scenario 3', () => {
      expect(isDateString('2021-01-01 11:00:00')).to.be.true;
    });
  });

  describe('returns false', () => {
    it('scenario 1', () => {
      expect(isDateString('11:00:00')).to.be.false;
    });

    it('scenario 2', () => {
      expect(isDateString('11:00')).to.be.false;
    });

    it('scenario 3', () => {
      expect(isDateString('')).to.be.false;
    });

    it('scenario 4', () => {
      expect(isDateString('invalid')).to.be.false;
    });
  });
});

describe('isDateTimeString', () => {
  describe('returns true', () => {
    it('scenario 1', () => {
      expect(isDateTimeString('2021-01-01T11:00:00')).to.be.true;
    });

    it('scenario 2', () => {
      expect(isDateTimeString('2021-01-01 11:00:00')).to.be.true;
    });

    it('scenario 3', () => {
      expect(isDateTimeString('2021-01-01T11:00')).to.be.true;
    });

    it('scenario 3', () => {
      expect(isDateTimeString('2021-01-01 11:00')).to.be.true;
    });
  });

  describe('returns false', () => {
    it('scenario 1', () => {
      expect(isDateTimeString('2021-01-01')).to.be.false;
    });

    it('scenario 2', () => {
      expect(isDateTimeString('11:00:00')).to.be.false;
    });

    it('scenario 3', () => {
      expect(isDateTimeString('11:00')).to.be.false;
    });

    it('scenario 4', () => {
      expect(isDateTimeString('')).to.be.false;
    });

    it('scenario 5', () => {
      expect(isDateTimeString('invalid')).to.be.false;
    });
  });
});

describe('isTimeString', () => {
  describe('returns true', () => {
    it('scenario 1', () => {
      expect(isTimeString('11:00:00')).to.be.true;
    });

    it('scenario 2', () => {
      expect(isTimeString('11:00')).to.be.true;
    });
  });

  describe('returns false', () => {
    it('scenario 1', () => {
      expect(isTimeString('2021-01-01')).to.be.false;
    });

    it('scenario 2', () => {
      expect(isDateTimeString('2021-01-01T11:00:00')).to.be.true;
    });

    it('scenario 3', () => {
      expect(isDateTimeString('2021-01-01 11:00:00')).to.be.true;
    });

    it('scenario 4', () => {
      expect(isDateTimeString('2021-01-01T11:00')).to.be.true;
    });

    it('scenario 5', () => {
      expect(isDateTimeString('2021-01-01 11:00')).to.be.true;
    });

    it('scenario 6', () => {
      expect(isTimeString('')).to.be.false;
    });

    it('scenario 7', () => {
      expect(isTimeString('invalid')).to.be.false;
    });
  });
});
