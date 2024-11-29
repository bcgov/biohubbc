import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import xlsx, { WorkSheet } from 'xlsx';
import { forEachCSVCell, validateCSVHeaders } from './csv-config-validation';
import { CSVConfig } from './csv-config-validation.interface';
chai.use(sinonChai);

describe.only('csv-config-validation', () => {
  afterEach(() => {
    sinon.restore();
  });
  describe('validateCSVHeaders', () => {
    it('should return an empty array if the headers are valid', () => {
      const mockConfig: CSVConfig = { staticHeadersConfig: { ALIAS: { aliases: [] } }, ignoreDynamicHeaders: true };
      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([{ ALIAS: 'value' }]);

      const result = validateCSVHeaders(worksheet, mockConfig);

      expect(result).to.deep.equal([]);
    });

    it('should return an error if the worksheet is empty', () => {
      const mockConfig: CSVConfig = { staticHeadersConfig: { ALIAS: { aliases: [] } }, ignoreDynamicHeaders: true };
      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([]);

      const result = validateCSVHeaders(worksheet, mockConfig);

      expect(result).to.deep.equal([{ rowIndex: 0, error: 'CSV is empty', solution: 'Add headers and data to CSV' }]);
    });

    it('should return an error if the worksheet is missing a required header', () => {
      const mockConfig: CSVConfig = { staticHeadersConfig: { ALIAS: { aliases: [] } }, ignoreDynamicHeaders: true };
      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([{ NOT_ALIAS: 'value' }]);

      const result = validateCSVHeaders(worksheet, mockConfig);

      expect(result).to.deep.equal([
        {
          rowIndex: 0,
          error: 'CSV missing required header',
          header: 'ALIAS',
          solution: "Add header 'ALIAS' to CSV"
        }
      ]);
    });

    it('should return an error if the worksheet has an unknown header and dynamic headers are not ignored', () => {
      const mockConfig: CSVConfig = { staticHeadersConfig: { ALIAS: { aliases: [] } }, ignoreDynamicHeaders: false };
      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([{ ALIAS: 'alias', UNKNOWN_HEADER: 'value' }]);

      const result = validateCSVHeaders(worksheet, mockConfig);

      expect(result).to.deep.equal([
        {
          rowIndex: 0,
          error: 'Unknown header in CSV',
          header: 'UNKNOWN_HEADER',
          solution: "Remove header 'UNKNOWN_HEADER' from CSV"
        }
      ]);
    });
  });

  describe('forEachCSVCell', () => {
    it('should iterate over each cell in the worksheet', () => {
      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([{ TEST: 'cellValue' }]);
      const config: CSVConfig = {
        staticHeadersConfig: { TEST: { aliases: [] } },
        ignoreDynamicHeaders: true
      };

      const callbackStub = sinon.stub();

      forEachCSVCell(worksheet, config, callbackStub);

      expect(callbackStub).to.have.been.calledOnceWithExactly(
        {
          cell: 'cellValue',
          header: 'TEST',
          rowIndex: 1,
          row: { TEST: 'cellValue' }
        },
        {
          aliases: [],
          staticHeader: 'TEST'
        }
      );
    });

    it('should iterate over each cell in the worksheet when alias is used', () => {
      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([{ TEST_ALIAS: 'cellValue' }]);
      const config: CSVConfig = {
        staticHeadersConfig: { TEST: { aliases: ['TEST_ALIAS'] } },
        ignoreDynamicHeaders: true
      };

      const callbackStub = sinon.stub();

      forEachCSVCell(worksheet, config, callbackStub);

      expect(callbackStub).to.have.been.calledOnceWithExactly(
        {
          cell: 'cellValue',
          header: 'TEST_ALIAS',
          rowIndex: 1,
          row: { TEST_ALIAS: 'cellValue' }
        },
        {
          aliases: [],
          staticHeader: 'TEST'
        }
      );
    });
  });
});
