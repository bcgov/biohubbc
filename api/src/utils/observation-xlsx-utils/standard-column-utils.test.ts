import { expect } from 'chai';
import { describe } from 'mocha';
import xlsx from 'xlsx';

import { DEFAULT_XLSX_SHEET_NAME } from '../media/xlsx/xlsx-file';
import * as standard_column_utils from './standard-column-utils';

describe('standard-column-utils', () => {
  describe('getNonStandardColumnNamesFromWorksheet', () => {
    it('returns the non-standard column headers in UPPERCASE', () => {
      const xlsxWorksheets: xlsx.WorkSheet = {
        [DEFAULT_XLSX_SHEET_NAME]: {
          A1: { t: 's', v: 'Species' },
          B1: { t: 's', v: 'Count' },
          C1: { t: 's', v: 'Date' },
          D1: { t: 's', v: 'Time' },
          E1: { t: 's', v: 'Latitude' },
          F1: { t: 's', v: 'Longitude' },
          G1: { t: 's', v: 'Antler Configuration' },
          H1: { t: 's', v: 'Wind Direction' },
          A2: { t: 'n', w: '180703', v: 180703 },
          B2: { t: 'n', w: '1', v: 1 },
          C2: { z: 'm/d/yy', t: 'd', v: '1970-01-01T08:00:00.000Z', w: '1/1/70' },
          D2: { t: 's', v: '9:01' },
          E2: { t: 'n', w: '-58', v: -58 },
          F2: { t: 'n', w: '-123', v: -123 },
          G2: { t: 's', v: 'more than 3 points' },
          H2: { t: 's', v: 'North' },
          A3: { t: 'n', w: '180596', v: 180596 },
          B3: { t: 'n', w: '2', v: 2 },
          C3: { z: 'm/d/yy', t: 'd', v: '1970-01-01T08:00:00.000Z', w: '1/1/70' },
          D3: { t: 's', v: '9:02' },
          E3: { t: 'n', w: '-57', v: -57 },
          F3: { t: 'n', w: '-122', v: -122 },
          H3: { t: 's', v: 'North' },
          A4: { t: 'n', w: '180713', v: 180713 },
          B4: { t: 'n', w: '3', v: 3 },
          C4: { z: 'm/d/yy', t: 'd', v: '1970-01-01T08:00:00.000Z', w: '1/1/70' },
          D4: { t: 's', v: '9:03' },
          E4: { t: 'n', w: '-56', v: -56 },
          F4: { t: 'n', w: '-121', v: -121 },
          H4: { t: 's', v: 'North' },
          '!ref': 'A1:H9'
        }
      };

      const result = standard_column_utils.getNonStandardColumnNamesFromWorksheet(xlsxWorksheets);

      expect(result).to.eql(['ANTLER CONFIGURATION', 'WIND DIRECTION']);
    });
  });

  describe('getTsnFromRow', () => {
    it('returns the tsn', () => {
      const row: Record<string, any> = {
        OTHER: 'other',
        ITIS_TSN: '123456',
        OTHER2: 'other2'
      };

      const result = standard_column_utils.getTsnFromRow(row);

      expect(result).to.equal('123456');
    });

    it('returns the tsn', () => {
      const row: Record<string, any> = {
        OTHER: 'other',
        TSN: '123456',
        OTHER2: 'other2'
      };

      const result = standard_column_utils.getTsnFromRow(row);

      expect(result).to.equal('123456');
    });

    it('returns the tsn', () => {
      const row: Record<string, any> = {
        OTHER: 'other',
        TAXON: '123456',
        OTHER2: 'other2'
      };

      const result = standard_column_utils.getTsnFromRow(row);

      expect(result).to.equal('123456');
    });

    it('returns the tsn', () => {
      const row: Record<string, any> = {
        OTHER: 'other',
        SPECIES: '123456',
        OTHER2: 'other2'
      };

      const result = standard_column_utils.getTsnFromRow(row);

      expect(result).to.equal('123456');
    });

    it('returns undefined when no known tsn field is present', () => {
      const row: Record<string, any> = {
        OTHER: 'other',
        OTHER2: 'other2'
      };

      const result = standard_column_utils.getTsnFromRow(row);

      expect(result).to.equal(undefined);
    });
  });

  describe('getCountFromRow', () => {
    it('returns the count', () => {
      const row: Record<string, any> = {
        OTHER: 'other',
        COUNT: '123456',
        OTHER2: 'other2'
      };

      const result = standard_column_utils.getCountFromRow(row);

      expect(result).to.equal('123456');
    });

    it('returns undefined when no known count field is present', () => {
      const row: Record<string, any> = {
        OTHER: 'other',
        OTHER2: 'other2'
      };

      const result = standard_column_utils.getCountFromRow(row);

      expect(result).to.equal(undefined);
    });
  });

  describe('getDateFromRow', () => {
    it('returns the date', () => {
      const row: Record<string, any> = {
        OTHER: 'other',
        DATE: '123456',
        OTHER2: 'other2'
      };

      const result = standard_column_utils.getDateFromRow(row);

      expect(result).to.equal('123456');
    });

    it('returns undefined when no known date field is present', () => {
      const row: Record<string, any> = {
        OTHER: 'other',
        OTHER2: 'other2'
      };

      const result = standard_column_utils.getDateFromRow(row);

      expect(result).to.equal(undefined);
    });
  });

  describe('getTimeFromRow', () => {
    it('returns the time', () => {
      const row: Record<string, any> = {
        OTHER: 'other',
        TIME: '123456',
        OTHER2: 'other2'
      };

      const result = standard_column_utils.getTimeFromRow(row);

      expect(result).to.equal('123456');
    });

    it('returns undefined when no known time field is present', () => {
      const row: Record<string, any> = {
        OTHER: 'other',
        OTHER2: 'other2'
      };

      const result = standard_column_utils.getTimeFromRow(row);

      expect(result).to.equal(undefined);
    });
  });

  describe('getLatitudeFromRow', () => {
    it('returns the latitude', () => {
      const row: Record<string, any> = {
        OTHER: 'other',
        LATITUDE: '123456',
        OTHER2: 'other2'
      };

      const result = standard_column_utils.getLatitudeFromRow(row);

      expect(result).to.equal('123456');
    });

    it('returns the latitude', () => {
      const row: Record<string, any> = {
        OTHER: 'other',
        LAT: '123456',
        OTHER2: 'other2'
      };

      const result = standard_column_utils.getLatitudeFromRow(row);

      expect(result).to.equal('123456');
    });

    it('returns undefined when no known latitude field is present', () => {
      const row: Record<string, any> = {
        OTHER: 'other',
        OTHER2: 'other2'
      };

      const result = standard_column_utils.getLatitudeFromRow(row);

      expect(result).to.equal(undefined);
    });
  });

  describe('getLongitudeFromRow', () => {
    it('returns the longitude', () => {
      const row: Record<string, any> = {
        OTHER: 'other',
        LONGITUDE: '123456',
        OTHER2: 'other2'
      };

      const result = standard_column_utils.getLongitudeFromRow(row);

      expect(result).to.equal('123456');
    });

    it('returns the longitude', () => {
      const row: Record<string, any> = {
        OTHER: 'other',
        LONG: '123456',
        OTHER2: 'other2'
      };

      const result = standard_column_utils.getLongitudeFromRow(row);

      expect(result).to.equal('123456');
    });

    it('returns the longitude', () => {
      const row: Record<string, any> = {
        OTHER: 'other',
        LON: '123456',
        OTHER2: 'other2'
      };

      const result = standard_column_utils.getLongitudeFromRow(row);

      expect(result).to.equal('123456');
    });

    it('returns the longitude', () => {
      const row: Record<string, any> = {
        OTHER: 'other',
        LNG: '123456',
        OTHER2: 'other2'
      };

      const result = standard_column_utils.getLongitudeFromRow(row);

      expect(result).to.equal('123456');
    });

    it('returns undefined when no known longitude field is present', () => {
      const row: Record<string, any> = {
        OTHER: 'other',
        OTHER2: 'other2'
      };

      const result = standard_column_utils.getLongitudeFromRow(row);

      expect(result).to.equal(undefined);
    });
  });
});
