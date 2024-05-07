import { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import xlsx from 'xlsx';
import { IXLSXCSVValidator } from '../xlsx-utils/worksheet-utils';
import * as worksheet_utils from './worksheet-utils';

describe('worksheet-utils', () => {
  describe('validateWorksheetHeaders', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should validate aliases', () => {
      const observationCSVColumnValidator: IXLSXCSVValidator = {
        columnNames: ['SPECIES', 'COUNT', 'DATE', 'TIME', 'LATITUDE', 'LONGITUDE'],
        columnTypes: ['number', 'number', 'date', 'string', 'number', 'number'],
        columnAliases: {
          LATITUDE: ['LAT'],
          LONGITUDE: ['LON', 'LONG', 'LNG'],
          SPECIES: ['TAXON']
        }
      };

      const mockWorksheet = {} as unknown as xlsx.WorkSheet;

      const getWorksheetHeaderssStub = sinon
        .stub(worksheet_utils, 'getWorksheetHeaders')
        .callsFake(() => ['TAXON', 'COUNT', 'DATE', 'TIME', 'LAT', 'LON']);

      const result = worksheet_utils.validateWorksheetHeaders(mockWorksheet, observationCSVColumnValidator);

      expect(getWorksheetHeaderssStub).to.be.calledOnce;
      expect(result).to.equal(true);
    });

    it('should fail for unknown aliases', () => {
      const observationCSVColumnValidator: IXLSXCSVValidator = {
        columnNames: ['SPECIES', 'COUNT', 'DATE', 'TIME', 'LATITUDE', 'LONGITUDE'],
        columnTypes: ['number', 'number', 'date', 'string', 'number', 'number'],
        columnAliases: {
          LATITUDE: ['LAT'],
          LONGITUDE: ['LON', 'LONG', 'LNG']
        }
      };

      const mockWorksheet = {} as unknown as xlsx.WorkSheet;

      const getWorksheetHeaderssStub = sinon
        .stub(worksheet_utils, 'getWorksheetHeaders')
        .callsFake(() => ['SPECIES', 'COUNT', 'DATE', 'TIME', 'SOMETHING_LAT', 'LON']);

      const result = worksheet_utils.validateWorksheetHeaders(mockWorksheet, observationCSVColumnValidator);

      expect(getWorksheetHeaderssStub).to.be.calledOnce;
      expect(result).to.equal(false);
    });
  });
});
