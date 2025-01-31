import { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import xlsx from 'xlsx';
import { getMockXLSXWorkbookBuffer } from '../../__mocks__/xlsx';
import { MediaFile } from '../media/media-file';
import { constructXLSXWorkbook, getDefaultWorksheet, IXLSXCSVValidator } from '../xlsx-utils/worksheet-utils';
import * as worksheet_utils from './worksheet-utils';

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
  C2: { t: 's', v: '1970-01-01T08:00:00.000Z' },
  D2: { t: 's', v: '9:01' },
  E2: { t: 'n', w: '-58', v: -58 },
  F2: { t: 'n', w: '-123', v: -123 },
  G2: { t: 's', v: 'more than 3 points' },
  H2: { t: 's', v: 'North' },
  A3: { t: 'n', w: '180596', v: 180596 },
  B3: { t: 'n', w: '2', v: 2 },
  C3: { t: 's', v: '1970-01-01T08:00:00.000Z' },
  D3: { t: 's', v: '9:02' },
  E3: { t: 'n', w: '-57', v: -57 },
  F3: { t: 'n', w: '-122', v: -122 },
  H3: { t: 's', v: 'North' },
  A4: { t: 'n', w: '180713', v: 180713 },
  B4: { t: 'n', w: '3', v: 3 },
  C4: { t: 's', v: '1970-01-01T08:00:00.000Z' },
  D4: { t: 's', v: '9:03' },
  E4: { t: 'n', w: '-56', v: -56 },
  F4: { t: 'n', w: '-121', v: -121 },
  H4: { t: 's', v: 'North' },
  '!ref': 'A1:H9'
};

describe('worksheet-utils', () => {
  describe('getHeadersUpperCase', () => {
    it('returns the column headers in UPPERCASE', () => {
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

  describe('getWorksheetRowObjects', () => {
    it('should return the worksheet row objects', () => {
      const buffer = getMockXLSXWorkbookBuffer([{ TEST: 'value' }]);
      const mediaFile = new MediaFile('text.xlsx', 'text/csv', buffer);

      const newWorkbook = constructXLSXWorkbook(mediaFile);
      const worksheet = getDefaultWorksheet(newWorkbook);

      const rowObjects = worksheet_utils.getWorksheetRowObjects(worksheet);

      expect(rowObjects.length).to.equal(1);
      expect(rowObjects[0].TEST).to.equal('value');
    });

    it('should return the worksheet row objects with multiple rows', () => {
      const buffer = getMockXLSXWorkbookBuffer([{ TEST: 'value' }, { TEST: 'value2' }]);
      const mediaFile = new MediaFile('text.xlsx', 'text/csv', buffer);

      const newWorkbook = constructXLSXWorkbook(mediaFile);
      const worksheet = getDefaultWorksheet(newWorkbook);

      const rowObjects = worksheet_utils.getWorksheetRowObjects(worksheet);

      expect(rowObjects.length).to.equal(2);
      expect(rowObjects[0].TEST).to.equal('value');
      expect(rowObjects[1].TEST).to.equal('value2');
    });

    it('should trim whitespace from cell values', () => {
      const buffer = getMockXLSXWorkbookBuffer([{ TEST: ' value ' }]);
      const mediaFile = new MediaFile('text.xlsx', 'text/csv', buffer);

      const newWorkbook = constructXLSXWorkbook(mediaFile);
      const worksheet = getDefaultWorksheet(newWorkbook);

      const rowObjects = worksheet_utils.getWorksheetRowObjects(worksheet);

      expect(rowObjects.length).to.equal(1);
      expect(rowObjects[0].TEST).to.equal('value');
    });

    it('should handle empty rows', () => {
      const buffer = getMockXLSXWorkbookBuffer([{ TEST: 'value' }, {}, { TEST: 'value2' }]);
      const mediaFile = new MediaFile('text.xlsx', 'text/csv', buffer);

      const newWorkbook = constructXLSXWorkbook(mediaFile);
      const worksheet = getDefaultWorksheet(newWorkbook);

      const rowObjects = worksheet_utils.getWorksheetRowObjects(worksheet);

      expect(rowObjects.length).to.equal(2);
    });

    it('should inject the row index symbol into the rows', () => {
      const buffer = getMockXLSXWorkbookBuffer([{ TEST: 'value' }, {}, { TEST: 'value2' }]);
      const mediaFile = new MediaFile('text.xlsx', 'text/csv', buffer);

      const newWorkbook = constructXLSXWorkbook(mediaFile);
      const worksheet = getDefaultWorksheet(newWorkbook);

      const rowObjects = worksheet_utils.getWorksheetRowObjects(worksheet);

      expect(rowObjects.length).to.equal(2);
      expect(rowObjects[0][worksheet_utils.WorksheetRowIndexSymbol]).to.equal(1);
      expect(rowObjects[1][worksheet_utils.WorksheetRowIndexSymbol]).to.equal(3);
    });

    it('should handle numeric epoch date format', () => {
      const buffer = getMockXLSXWorkbookBuffer([{ DATE: '2024-01-31' }]);
      const mediaFile = new MediaFile('text.xlsx', 'text/csv', buffer);

      const newWorkbook = constructXLSXWorkbook(mediaFile);
      const worksheet = getDefaultWorksheet(newWorkbook);

      worksheet['A2'].z = worksheet_utils.CUSTOM_XLSX_DATE_FORMAT;
      worksheet['A2'].v = 999999;

      const rowObjects = worksheet_utils.getWorksheetRowObjects(worksheet);

      expect(rowObjects[0].DATE).to.equal('2024-01-31');
    });

    it('should handle numeric epoch time format', () => {
      const buffer = getMockXLSXWorkbookBuffer([{ TIME: '12:00:00' }]);
      const mediaFile = new MediaFile('text.xlsx', 'text/csv', buffer);

      const newWorkbook = constructXLSXWorkbook(mediaFile);
      const worksheet = getDefaultWorksheet(newWorkbook);

      worksheet['A2'].z = worksheet_utils.CUSTOM_XLSX_DATE_FORMAT;
      worksheet['A2'].v = 0.5;

      const rowObjects = worksheet_utils.getWorksheetRowObjects(worksheet);

      expect(rowObjects[0].TIME).to.equal('12:00:00');
    });

    it('should handle date format 2024-01-31', () => {
      const buffer = getMockXLSXWorkbookBuffer([{ DATE: '2024-01-31' }]);
      const mediaFile = new MediaFile('text.xlsx', 'text/csv', buffer);

      const newWorkbook = constructXLSXWorkbook(mediaFile);
      const worksheet = getDefaultWorksheet(newWorkbook);

      worksheet['A2'].z = worksheet_utils.CUSTOM_XLSX_DATE_FORMAT;
      worksheet['A2'].v = 999999;

      const rowObjects = worksheet_utils.getWorksheetRowObjects(worksheet);

      expect(rowObjects[0].DATE).to.equal('2024-01-31');
    });

    it('should handle date format 2024/01/31', () => {
      const buffer = getMockXLSXWorkbookBuffer([{ DATE: '2024/01/31' }]);
      const mediaFile = new MediaFile('text.xlsx', 'text/csv', buffer);

      const newWorkbook = constructXLSXWorkbook(mediaFile);
      const worksheet = getDefaultWorksheet(newWorkbook);

      worksheet['A2'].z = worksheet_utils.CUSTOM_XLSX_DATE_FORMAT;
      worksheet['A2'].v = 999999;

      const rowObjects = worksheet_utils.getWorksheetRowObjects(worksheet);

      expect(rowObjects[0].DATE).to.equal('2024-01-31');
    });

    it('should handle date format 31-01-2024', () => {
      const buffer = getMockXLSXWorkbookBuffer([{ DATE: '31-01-2024' }]);
      const mediaFile = new MediaFile('text.xlsx', 'text/csv', buffer);

      const newWorkbook = constructXLSXWorkbook(mediaFile);
      const worksheet = getDefaultWorksheet(newWorkbook);

      worksheet['A2'].z = worksheet_utils.CUSTOM_XLSX_DATE_FORMAT;
      worksheet['A2'].v = 999999;

      const rowObjects = worksheet_utils.getWorksheetRowObjects(worksheet);

      expect(rowObjects[0].DATE).to.equal('2024-01-31');
    });

    it('should handle date format 31/01/2024', () => {
      const buffer = getMockXLSXWorkbookBuffer([{ DATE: '31/01/2024' }]);
      const mediaFile = new MediaFile('text.xlsx', 'text/csv', buffer);

      const newWorkbook = constructXLSXWorkbook(mediaFile);
      const worksheet = getDefaultWorksheet(newWorkbook);

      worksheet['A2'].z = worksheet_utils.CUSTOM_XLSX_DATE_FORMAT;
      worksheet['A2'].v = 999999;

      const rowObjects = worksheet_utils.getWorksheetRowObjects(worksheet);

      expect(rowObjects[0].DATE).to.equal('2024-01-31');
    });

    it('should handle date format 01-31-2024', () => {
      const buffer = getMockXLSXWorkbookBuffer([{ DATE: '01-31-2024' }]);
      const mediaFile = new MediaFile('test.csv', 'text/csv', buffer);

      const newWorkbook = constructXLSXWorkbook(mediaFile);
      const worksheet = getDefaultWorksheet(newWorkbook);

      worksheet['A2'].z = worksheet_utils.CUSTOM_XLSX_DATE_FORMAT;
      worksheet['A2'].v = 999999;

      const rowObjects = worksheet_utils.getWorksheetRowObjects(worksheet);

      expect(rowObjects[0].DATE).to.equal('2024-01-31');
    });

    it('should handle date format 01/31/2024', () => {
      const buffer = getMockXLSXWorkbookBuffer([{ DATE: '01/31/2024' }]);
      const mediaFile = new MediaFile('test.csv', 'text/csv', buffer);

      const newWorkbook = constructXLSXWorkbook(mediaFile);
      const worksheet = getDefaultWorksheet(newWorkbook);

      worksheet['A2'].z = worksheet_utils.CUSTOM_XLSX_DATE_FORMAT;
      worksheet['A2'].v = 999999;

      const rowObjects = worksheet_utils.getWorksheetRowObjects(worksheet);

      expect(rowObjects[0].DATE).to.equal('2024-01-31');
    });

    it('should handle date format 2024-01-31', () => {
      const buffer = getMockXLSXWorkbookBuffer([{ DATE: '2024-01-31' }]);
      const mediaFile = new MediaFile('test.csv', 'text/csv', buffer);

      const newWorkbook = constructXLSXWorkbook(mediaFile);
      const worksheet = getDefaultWorksheet(newWorkbook);

      worksheet['A2'].z = worksheet_utils.CUSTOM_XLSX_DATE_FORMAT;
      worksheet['A2'].v = 999999;

      const rowObjects = worksheet_utils.getWorksheetRowObjects(worksheet);

      expect(rowObjects[0].DATE).to.equal('2024-01-31');
    });

    it('should handle date format 2024/01/31', () => {
      const buffer = getMockXLSXWorkbookBuffer([{ DATE: '2024/01/31' }]);
      const mediaFile = new MediaFile('test.csv', 'text/csv', buffer);

      const newWorkbook = constructXLSXWorkbook(mediaFile);
      const worksheet = getDefaultWorksheet(newWorkbook);

      worksheet['A2'].z = worksheet_utils.CUSTOM_XLSX_DATE_FORMAT;
      worksheet['A2'].v = 999999;

      const rowObjects = worksheet_utils.getWorksheetRowObjects(worksheet);

      expect(rowObjects[0].DATE).to.equal('2024-01-31');
    });
  });
});
