import { expect } from 'chai';
import { formatDateString, isDateString, isDateTimeString, isTimeString } from './date-time-utils';

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

  describe('formatStringDateCell', () => {
    it('should return null when string is not shaped like a date', () => {
      expect(formatDateString('TEST')).to.be.null;
    });

    it('should return null when string is not a 3 part delimited string', () => {
      expect(formatDateString('01-01')).to.be.null;
      expect(formatDateString('01-01-2024-01')).to.be.null;
      expect(formatDateString('01/01')).to.be.null;
    });

    it('should return null when string is not a valid date', () => {
      expect(formatDateString('99-99-9999')).to.be.null;
    });

    it('should format 2024-01-31', () => {
      expect(formatDateString('2024-01-31')).to.equal('2024-01-31');
    });

    it('should format ambiguous 2024-01-02', () => {
      expect(formatDateString('2024-01-02')).to.equal('2024-01-02');
    });

    it('should format 2024/01/31', () => {
      expect(formatDateString('2024/01/31')).to.equal('2024-01-31');
    });

    it('should format ambiguous 2024/01/02', () => {
      expect(formatDateString('2024/01/02')).to.equal('2024-01-02');
    });

    it('should format 31-01-2024', () => {
      expect(formatDateString('31-01-2024')).to.equal('2024-01-31');
    });

    it('should format ambiguous 02-01-2024', () => {
      expect(formatDateString('02-01-2024')).to.equal('2024-01-02');
    });

    it('should format 31/01/2024', () => {
      expect(formatDateString('31/01/2024')).to.equal('2024-01-31');
    });

    it('should format ambiguous 02/01/2024', () => {
      expect(formatDateString('02/01/2024')).to.equal('2024-01-02');
    });

    it('should format 01-31-2024', () => {
      expect(formatDateString('01-31-2024')).to.equal('2024-01-31');
    });

    it('should format ambiguous 01-02-2024', () => {
      expect(formatDateString('01-02-2024')).to.equal('2024-02-01');
    });

    it('should format 01/31/2024', () => {
      expect(formatDateString('01/31/2024')).to.equal('2024-01-31');
    });

    it('should format ambiguous 01/02/2024', () => {
      expect(formatDateString('01/02/2024')).to.equal('2024-02-01');
    });

    it('should format 2024-01-31', () => {
      expect(formatDateString('2024-01-31')).to.equal('2024-01-31');
    });

    it('should format 2024/01/31', () => {
      expect(formatDateString('2024/01/31')).to.equal('2024-01-31');
    });

    it('should format ambiguous 2024/01/02', () => {
      expect(formatDateString('2024/01/02')).to.equal('2024-01-02');
    });
  });
});
