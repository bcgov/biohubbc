import { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import xlsx from 'xlsx';
import { IXLSXCSVValidator } from '../xlsx-utils/worksheet-utils';
import * as worksheet_utils from './worksheet-utils';

describe('worksheet-utils', () => {
  describe('getHeadersUpperCase', () => {
    it('returns the column headers in UPPERCASE', () => {
      const xlsxWorksheet: xlsx.WorkSheet = {
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
      };

      const result = worksheet_utils.getHeadersUpperCase(xlsxWorksheet);

      expect(result).to.eql([
        'SPECIES',
        'COUNT',
        'DATE',
        'TIME',
        'LATITUDE',
        'LONGITUDE',
        'ANTLER CONFIGURATION',
        'WIND DIRECTION'
      ]);
    });
  });

  describe('validateWorksheetHeaders', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should validate aliases', () => {
      const observationCSVColumnValidator: IXLSXCSVValidator = {
        SPECIES: { type: 'string', aliases: ['TAXON'] },
        COUNT: { type: 'number' },
        DATE: { type: 'string' },
        TIME: { type: 'string' },
        LATITUDE: { type: 'number', aliases: ['LAT'] },
        LONGITUDE: { type: 'number', aliases: ['LON', 'LONG', 'LNG'] }
      };

      const mockWorksheet = {} as unknown as xlsx.WorkSheet;

      const getHeadersUpperCaseStub = sinon
        .stub(worksheet_utils, 'getHeadersUpperCase')
        .callsFake(() => ['TAXON', 'COUNT', 'DATE', 'TIME', 'LAT', 'LON']);

      const result = worksheet_utils.validateWorksheetHeaders(mockWorksheet, observationCSVColumnValidator);

      expect(getHeadersUpperCaseStub).to.be.calledOnce;
      expect(result).to.equal(true);
    });

    it('should validate for missing optional headers', () => {
      const observationCSVColumnValidator: IXLSXCSVValidator = {
        SPECIES: { type: 'string', aliases: ['TAXON'], optional: true },
        COUNT: { type: 'number', optional: true },
        DATE: { type: 'string' },
        TIME: { type: 'string' },
        LATITUDE: { type: 'number', aliases: ['LAT'] },
        LONGITUDE: { type: 'number', aliases: ['LON', 'LONG', 'LNG'] }
      };

      const mockWorksheet = {} as unknown as xlsx.WorkSheet;

      const getHeadersUpperCaseStub = sinon
        .stub(worksheet_utils, 'getHeadersUpperCase')
        .callsFake(() => ['DATE', 'TIME', 'LAT', 'LON']);

      const result = worksheet_utils.validateWorksheetHeaders(mockWorksheet, observationCSVColumnValidator);

      expect(getHeadersUpperCaseStub).to.be.calledOnce;
      expect(result).to.equal(true);
    });

    it('should succeed for header thats optional but provided', () => {
      const observationCSVColumnValidator: IXLSXCSVValidator = {
        SPECIES: { type: 'string', aliases: ['TAXON'], optional: true },
        COUNT: { type: 'number' },
        DATE: { type: 'string' },
        TIME: { type: 'string' },
        LATITUDE: { type: 'number', aliases: ['LAT'] },
        LONGITUDE: { type: 'number', aliases: ['LON', 'LONG', 'LNG'] }
      };

      const mockWorksheet = {} as unknown as xlsx.WorkSheet;

      const getHeadersUpperCaseStub = sinon
        .stub(worksheet_utils, 'getHeadersUpperCase')
        .callsFake(() => ['TAXON', 'COUNT', 'DATE', 'TIME', 'LAT', 'LON']);

      const result = worksheet_utils.validateWorksheetHeaders(mockWorksheet, observationCSVColumnValidator);

      expect(getHeadersUpperCaseStub).to.be.calledOnce;
      expect(result).to.equal(true);
    });

    it('should fail for unknown aliases', () => {
      const observationCSVColumnValidator: IXLSXCSVValidator = {
        SPECIES: { type: 'string', aliases: ['TAXON'] },
        COUNT: { type: 'number' },
        DATE: { type: 'string' },
        TIME: { type: 'string' },
        LATITUDE: { type: 'number', aliases: ['LAT'] },
        LONGITUDE: { type: 'number', aliases: ['LON', 'LONG', 'LNG'] }
      };

      const mockWorksheet = {} as unknown as xlsx.WorkSheet;

      const getHeadersUpperCaseStub = sinon
        .stub(worksheet_utils, 'getHeadersUpperCase')
        .callsFake(() => ['SPECIES', 'COUNT', 'DATE', 'TIME', 'SOMETHING_LAT', 'LON']);

      const result = worksheet_utils.validateWorksheetHeaders(mockWorksheet, observationCSVColumnValidator);

      expect(getHeadersUpperCaseStub).to.be.calledOnce;
      expect(result).to.equal(false);
    });
  });
});
