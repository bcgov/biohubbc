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

    describe('edge cases', () => {
      it('should format 1-8-2007', () => {
        expect(formatDateString('1-8-2007')).to.equal('2007-08-01');
        expect(formatDateString('1/8/2007')).to.equal('2007-08-01');
      });
    });

    describe('Canadian formats', () => {
      it('should format YYYY-MM-DD', () => {
        expect(formatDateString('2024-01-31')).to.equal('2024-01-31');
        expect(formatDateString('2024/01/31')).to.equal('2024-01-31');
      });

      it('should format ambiguous YYYY-MM-DD', () => {
        expect(formatDateString('2024-01-02')).to.equal('2024-01-02');
        expect(formatDateString('2024/01/02')).to.equal('2024-01-02');
      });

      it('should format DD-MM-YYYY', () => {
        expect(formatDateString('31-01-2024')).to.equal('2024-01-31');
        expect(formatDateString('31/01/2024')).to.equal('2024-01-31');
      });

      it('should format ambiguous DD-MM-YYYY', () => {
        expect(formatDateString('02-01-2024')).to.equal('2024-01-02');
        expect(formatDateString('02/01/2024')).to.equal('2024-01-02');
      });

      it('should format YYYY-M-D', () => {
        expect(formatDateString('2024-1-31')).to.equal('2024-01-31');
        expect(formatDateString('2024/1/31')).to.equal('2024-01-31');
      });

      it('should format ambiguous YYYY-M-D', () => {
        expect(formatDateString('2024-1-2')).to.equal('2024-01-02');
        expect(formatDateString('2024/1/2')).to.equal('2024-01-02');
      });
    });

    describe('American formats (prioritizes canadian formats first)', () => {
      it('should format YYYY-MM-DD', () => {
        expect(formatDateString('2024-01-31')).to.equal('2024-01-31');
        expect(formatDateString('2024/01/31')).to.equal('2024-01-31');
      });

      it('should format ambiguous YYYY-DD-MM', () => {
        expect(formatDateString('2024-02-01')).to.equal('2024-02-01');
        expect(formatDateString('2024/02/01')).to.equal('2024-02-01');
      });

      it('should format MM-DD-YYYY', () => {
        expect(formatDateString('01-31-2024')).to.equal('2024-01-31');
        expect(formatDateString('01/31/2024')).to.equal('2024-01-31');
      });

      it('should format ambiguous MM-DD-YYYY', () => {
        expect(formatDateString('01-02-2024')).to.equal('2024-02-01');
        expect(formatDateString('01/02/2024')).to.equal('2024-02-01');
      });

      it('should format YYYY-D-M', () => {
        expect(formatDateString('2024-31-1')).to.equal('2024-01-31');
        expect(formatDateString('2024/31/1')).to.equal('2024-01-31');
      });

      it('should format ambiguous YYYY-D-M', () => {
        expect(formatDateString('2024-2-1')).to.equal('2024-02-01');
        expect(formatDateString('2024/2/1')).to.equal('2024-02-01');
      });
    });
  });
});
