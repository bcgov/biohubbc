import { expect } from 'chai';
import {
  formatDateCellValue,
  isDateCell,
  isStringCell,
  isTimeCell,
  replaceCellDates,
  trimCellWhitespace
} from './cell-utils';
import { CUSTOM_XLSX_DATE_FORMAT } from './worksheet-utils';

describe('cell-utils', () => {
  describe('replaceCellDates', () => {
    it('should return the cell when no value', () => {
      expect(replaceCellDates({ t: 'n' })).to.deep.equal({ t: 'n' });
    });

    it('should return the cell when not a date', () => {
      expect(replaceCellDates({ t: 's', v: 'TEST' })).to.deep.equal({ t: 's', v: 'TEST' });
      expect(replaceCellDates({ t: 's', v: 0 })).to.deep.equal({ t: 's', v: 0 });
    });

    it('should format a time epoch value', () => {
      expect(replaceCellDates({ t: 'n', v: 0.5, z: CUSTOM_XLSX_DATE_FORMAT }).v).to.equal('12:00:00');
    });

    it('should format a date epoch value', () => {
      expect(replaceCellDates({ t: 'n', v: 434565, z: CUSTOM_XLSX_DATE_FORMAT, w: '01-01-2024' }).v).to.equal(
        '2024-01-01'
      );
    });

    it('should return Invalid Date Format for a bad date', () => {
      expect(replaceCellDates({ t: 'n', v: 434565, z: CUSTOM_XLSX_DATE_FORMAT, w: '01-012024' }).v).to.equal(
        'Invalid Date Format'
      );
    });

    it('should format a string date value', () => {
      expect(replaceCellDates({ t: 's', v: '01-01-2024' }).v).to.equal('2024-01-01');
    });
  });

  describe('formatStringDateCell', () => {
    it('should return null when string is not shaped like a date', () => {
      expect(formatDateCellValue('TEST')).to.be.null;
    });

    it('should return null when string is not a 3 part delimited string', () => {
      expect(formatDateCellValue('01-01')).to.be.null;
      expect(formatDateCellValue('01-01-2024-01')).to.be.null;
      expect(formatDateCellValue('01/01')).to.be.null;
    });

    it('should return null when string is not a valid date', () => {
      expect(formatDateCellValue('99-99-9999')).to.be.null;
    });

    it('should format 2024-01-31', () => {
      expect(formatDateCellValue('2024-01-31')).to.equal('2024-01-31');
    });

    it('should format ambiguous 2024-01-02', () => {
      expect(formatDateCellValue('2024-01-02')).to.equal('2024-01-02');
    });

    it('should format 2024/01/31', () => {
      expect(formatDateCellValue('2024/01/31')).to.equal('2024-01-31');
    });

    it('should format ambiguous 2024/01/02', () => {
      expect(formatDateCellValue('2024/01/02')).to.equal('2024-01-02');
    });

    it('should format 31-01-2024', () => {
      expect(formatDateCellValue('31-01-2024')).to.equal('2024-01-31');
    });

    it('should format ambiguous 02-01-2024', () => {
      expect(formatDateCellValue('02-01-2024')).to.equal('2024-01-02');
    });

    it('should format 31/01/2024', () => {
      expect(formatDateCellValue('31/01/2024')).to.equal('2024-01-31');
    });

    it('should format ambiguous 02/01/2024', () => {
      expect(formatDateCellValue('02/01/2024')).to.equal('2024-01-02');
    });

    it('should format 01-31-2024', () => {
      expect(formatDateCellValue('01-31-2024')).to.equal('2024-01-31');
    });

    it('should format ambiguous 01-02-2024', () => {
      expect(formatDateCellValue('01-02-2024')).to.equal('2024-02-01');
    });

    it('should format 01/31/2024', () => {
      expect(formatDateCellValue('01/31/2024')).to.equal('2024-01-31');
    });

    it('should format ambiguous 01/02/2024', () => {
      expect(formatDateCellValue('01/02/2024')).to.equal('2024-02-01');
    });

    it('should format 2024-01-31', () => {
      expect(formatDateCellValue('2024-01-31')).to.equal('2024-01-31');
    });

    it('should format 2024/01/31', () => {
      expect(formatDateCellValue('2024/01/31')).to.equal('2024-01-31');
    });

    it('should format ambiguous 2024/01/02', () => {
      expect(formatDateCellValue('2024/01/02')).to.equal('2024-01-02');
    });
  });

  describe('trimCellWhitespace', () => {
    it('should trim cell value', () => {
      const cell = trimCellWhitespace({ t: 's', v: '  TEST  ', w: ' OTHER ' });

      expect(cell.v).to.equal('TEST');
      expect(cell.w).to.equal('OTHER');
    });
  });

  describe('isStringCell', () => {
    it('should return true for string cell', () => {
      expect(isStringCell({ t: 's' })).to.be.true;
    });

    it('should return false for non-string cell', () => {
      expect(isStringCell({ t: 'n' })).to.be.false;
    });
  });

  describe('isDateCell', () => {
    it('should return true for date cell', () => {
      expect(isDateCell({ t: 'n', z: CUSTOM_XLSX_DATE_FORMAT, v: 4321 })).to.be.true;
    });

    it('should return true for 1', () => {
      expect(isDateCell({ t: 'n', z: CUSTOM_XLSX_DATE_FORMAT, v: 1 })).to.be.true;
    });

    it('should return false for non-date cell', () => {
      expect(isDateCell({ t: 'n' })).to.be.false;
    });

    it('should return false for time epoch', () => {
      expect(isDateCell({ t: 'n', z: CUSTOM_XLSX_DATE_FORMAT, v: 0.99999 })).to.be.false;
    });
  });

  describe('isTimeCell', () => {
    it('should return true for time cell', () => {
      expect(isTimeCell({ t: 'n', z: CUSTOM_XLSX_DATE_FORMAT, v: 0.5 })).to.be.true;
    });

    it('should return true for 0', () => {
      expect(isTimeCell({ t: 'n', z: CUSTOM_XLSX_DATE_FORMAT, v: 0 })).to.be.true;
    });

    it('should return false for non-time cell', () => {
      expect(isTimeCell({ t: 'n' })).to.be.false;
    });

    it('should return false for date epoch', () => {
      expect(isTimeCell({ t: 'n', z: CUSTOM_XLSX_DATE_FORMAT, v: 1 })).to.be.false;
    });
  });
});
