import { expect } from 'chai';
import { formatDateCellValue, replaceCellDates } from './cell-utils';

describe('cell-utils', () => {
  describe('replaceCellDates', () => {
    it('should return the cell when no value', () => {
      expect(replaceCellDates({ t: 'n' })).to.deep.equal({ t: 'n' });
    });

    it('should return the cell when not a date', () => {
      expect(replaceCellDates({ t: 's', v: 'TEST' })).to.deep.equal({ t: 's', v: 'TEST' });
      expect(replaceCellDates({ t: 's', v: 0 })).to.deep.equal({ t: 's', v: 0 });
    });
  });

  describe('formatStringDateCell', () => {
    it('should format 2024-01-31', () => {
      expect(formatDateCellValue('2024-01-31')).to.equal('2024-01-31');
    });

    it('should format 2024/01/31', () => {
      expect(formatDateCellValue('2024/01/31')).to.equal('2024-01-31');
    });

    it('should format 31-01-2024', () => {
      expect(formatDateCellValue('31-01-2024')).to.equal('2024-01-31');
    });

    it('should format 31/01/2024', () => {
      expect(formatDateCellValue('31/01/2024')).to.equal('2024-01-31');
    });

    it('should format 01-31-2024', () => {
      expect(formatDateCellValue('01-31-2024')).to.equal('2024-01-31');
    });

    it('should format 01/31/2024', () => {
      expect(formatDateCellValue('01/31/2024')).to.equal('2024-01-31');
    });

    it('should format 2024-01-31', () => {
      expect(formatDateCellValue('2024-01-31')).to.equal('2024-01-31');
    });

    it('should format 2024/01/31', () => {
      expect(formatDateCellValue('2024/01/31')).to.equal('2024-01-31');
    });
  });
});
