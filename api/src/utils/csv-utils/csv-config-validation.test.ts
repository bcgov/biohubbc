import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import xlsx, { WorkSheet } from 'xlsx';
import {
  executeSetCellValue,
  executeValidateCell,
  forEachCSVCell,
  validateCSVHeaders,
  validateCSVWorksheet
} from './csv-config-validation';
import { CSVConfig } from './csv-config-validation.interface';
chai.use(sinonChai);

describe('csv-config-validation', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('validateCSVWorksheet', () => {
    it('should return rows when CSV is valid', () => {
      const validateCellStub = sinon.stub().returns([]);
      const setCellValueStub = sinon.stub().returns('newValue');

      const validateDynamicCellStub = sinon.stub().returns([]);
      const setCellValueDynamicStub = sinon.stub().returns('newDynamicValue');

      const mockConfig: CSVConfig = {
        staticHeadersConfig: {
          ALIAS: {
            aliases: ['ALIAS_2'],
            validateCell: validateCellStub,
            setCellValue: setCellValueStub
          }
        },
        dynamicHeadersConfig: {
          validateCell: validateDynamicCellStub,
          setCellValue: setCellValueDynamicStub
        },
        ignoreDynamicHeaders: false
      };

      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([
        { ALIAS_2: 'value', DYNAMIC_HEADER: 'dynamicValue', OTHER_DYNAMIC_HEADER: 'otherDynamicValue' }
      ]);

      const result = validateCSVWorksheet(worksheet, mockConfig);

      expect(validateCellStub).to.have.been.calledOnce;
      expect(setCellValueStub).to.have.been.calledOnce;

      expect(validateDynamicCellStub).to.have.been.calledTwice;
      expect(setCellValueDynamicStub).to.have.been.calledTwice;

      expect(result).to.deep.equal({
        errors: [],
        rows: [
          {
            ALIAS: 'newValue',
            DYNAMIC_HEADER: 'newDynamicValue',
            OTHER_DYNAMIC_HEADER: 'newDynamicValue'
          }
        ]
      });
    });

    it('should only call execute handlers when headers have no errors', () => {
      const validateCellStub = sinon.stub().returns([]);
      const setCellValueStub = sinon.stub().returns('newValue');

      const mockConfig: CSVConfig = {
        staticHeadersConfig: {
          ALIAS: {
            aliases: ['ALIAS_2'],
            validateCell: validateCellStub,
            setCellValue: setCellValueStub
          }
        },
        ignoreDynamicHeaders: true
      };

      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([{ BAD: 'value' }]);

      const result = validateCSVWorksheet(worksheet, mockConfig);

      expect(validateCellStub).to.have.been.not.calledOnce;
      expect(setCellValueStub).to.have.been.not.calledOnce;

      expect(result).to.deep.equal({
        errors: [
          {
            error: 'A required column is missing',
            solution: `Add all required columns to the file.`,
            header: 'ALIAS',
            values: ['ALIAS', 'ALIAS_2'],
            errorRowIndex: 0
          }
        ],
        rows: []
      });
    });
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

      expect(result).to.deep.equal([
        {
          errorRowIndex: 0,
          error: 'No columns in the file',
          solution: 'Add column names. Did you accidentally include an empty first row above the columns?',
          values: ['ALIAS']
        }
      ]);
    });

    it('should return an error if CSV missing row data', () => {
      const mockConfig: CSVConfig = { staticHeadersConfig: { ALIAS: { aliases: [] } }, ignoreDynamicHeaders: true };
      const worksheet: WorkSheet = { A1: { t: 's', v: 'ALIAS' }, '!ref': 'A1' };

      const result = validateCSVHeaders(worksheet, mockConfig);

      expect(result).to.deep.equal([
        {
          errorRowIndex: 1,
          error: 'No rows in the file',
          solution: 'Add rows. Did you accidentally import the wrong file?'
        }
      ]);
    });

    it('should return an error if the worksheet is missing a required header', () => {
      const mockConfig: CSVConfig = { staticHeadersConfig: { ALIAS: { aliases: [] } }, ignoreDynamicHeaders: true };
      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([{ NOT_ALIAS: 'value' }]);

      const result = validateCSVHeaders(worksheet, mockConfig);

      expect(result).to.deep.equal([
        {
          errorRowIndex: 0,
          error: 'A required column is missing',
          solution: `Add all required columns to the file.`,
          header: 'ALIAS',
          values: ['ALIAS']
        }
      ]);
    });

    it('should return an error if the worksheet has an unknown header and dynamic headers are not ignored', () => {
      const mockConfig: CSVConfig = { staticHeadersConfig: { ALIAS: { aliases: [] } }, ignoreDynamicHeaders: false };
      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([{ ALIAS: 'alias', UNKNOWN_HEADER: 'value' }]);

      const result = validateCSVHeaders(worksheet, mockConfig);

      expect(result).to.deep.equal([
        {
          errorRowIndex: 0,
          error: 'An unknown column is included in the file',
          solution: `Remove extra columns from the file.`,
          header: 'UNKNOWN_HEADER'
        }
      ]);
    });
  });

  describe('forEachCSVCell', () => {
    it('should iterate over each cell in the worksheet', () => {
      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([{ TEST: 'cellValue' }]);

      const validateCellStub = sinon.stub();
      const setCellValueStub = sinon.stub();

      const config: CSVConfig = {
        staticHeadersConfig: {
          TEST: {
            aliases: [],
            validateCell: validateCellStub,
            setCellValue: setCellValueStub
          }
        },
        ignoreDynamicHeaders: true
      };

      const callbackStub = sinon.stub();

      forEachCSVCell(worksheet, config, callbackStub);

      expect(callbackStub).to.have.been.calledOnceWithExactly(
        {
          cell: 'cellValue',
          header: 'TEST',
          rowIndex: 0,
          row: { TEST: 'cellValue' },
          staticHeader: 'TEST'
        },
        {
          validateCell: validateCellStub,
          setCellValue: setCellValueStub
        }
      );
    });

    it('should iterate over each cell in the worksheet when alias is used', () => {
      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([{ TEST_ALIAS: 'cellValue' }]);

      const validateCellStub = sinon.stub();
      const setCellValueStub = sinon.stub();

      const config: CSVConfig = {
        staticHeadersConfig: {
          TEST: {
            aliases: ['TEST_ALIAS'],
            validateCell: validateCellStub,
            setCellValue: setCellValueStub
          }
        },
        ignoreDynamicHeaders: true
      };

      const callbackStub = sinon.stub();

      forEachCSVCell(worksheet, config, callbackStub);

      expect(callbackStub).to.have.been.calledOnceWithExactly(
        {
          cell: 'cellValue',
          header: 'TEST_ALIAS',
          rowIndex: 0,
          row: { TEST_ALIAS: 'cellValue' },
          staticHeader: 'TEST'
        },
        {
          validateCell: validateCellStub,
          setCellValue: setCellValueStub
        }
      );
    });

    it('should iterate over dynamic cell values', () => {
      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([
        { TEST_ALIAS: 'cellValue', DYNAMIC_HEADER: 'dynamicValue' }
      ]);

      const staticValidateCellStub = sinon.stub();
      const staticSetCellValueStub = sinon.stub();

      const validateDynamicCellStub = sinon.stub();
      const setCellValueDynamicStub = sinon.stub();

      const config: CSVConfig = {
        staticHeadersConfig: {
          TEST: {
            aliases: ['TEST_ALIAS'],
            validateCell: staticValidateCellStub,
            setCellValue: staticSetCellValueStub
          }
        },
        dynamicHeadersConfig: {
          validateCell: validateDynamicCellStub,
          setCellValue: setCellValueDynamicStub
        },
        ignoreDynamicHeaders: false
      };

      const callbackStub = sinon.stub();

      forEachCSVCell(worksheet, config, callbackStub);

      expect(callbackStub).to.have.been.calledTwice;

      expect(callbackStub.getCall(0).args).to.deep.equal([
        {
          cell: 'cellValue',
          header: 'TEST_ALIAS',
          rowIndex: 0,
          row: { TEST_ALIAS: 'cellValue', DYNAMIC_HEADER: 'dynamicValue' },
          staticHeader: 'TEST'
        },
        {
          validateCell: staticValidateCellStub,
          setCellValue: staticSetCellValueStub
        }
      ]);

      expect(callbackStub.getCall(1).args).to.deep.equal([
        {
          cell: 'dynamicValue',
          header: 'DYNAMIC_HEADER',
          rowIndex: 0,
          row: { TEST_ALIAS: 'cellValue', DYNAMIC_HEADER: 'dynamicValue' },
          staticHeader: undefined // Dynamic headers have no static header mapping
        },
        {
          validateCell: validateDynamicCellStub,
          setCellValue: setCellValueDynamicStub
        }
      ]);
    });
  });

  describe('executeValidateCell', () => {
    it('should call the validateCell callback and mutate errors array', () => {
      const errors: any[] = [];

      const validateCellStub = sinon.stub().returns([{ error: 'error', solution: 'solution' }]);

      const params = {
        cell: 'cellValue',
        header: 'TEST',
        rowIndex: 0,
        row: { TEST: 'cellValue' },
        staticHeader: 'TEST'
      };

      const headerConfig = {
        validateCell: validateCellStub
      };

      executeValidateCell(params, headerConfig, errors);
      expect(validateCellStub).to.have.been.calledOnceWithExactly(params);
      expect(errors).to.deep.equal([
        {
          error: 'error',
          solution: 'solution',
          cell: 'cellValue',
          header: 'TEST',
          errorRowIndex: 1,
          values: undefined
        }
      ]);
    });
  });

  describe('executeSetCellValue', () => {
    it('should call the setCellValue callback and mutate the row', () => {
      const row = { TEST: 'cellValue' };

      const setCellValueStub = sinon.stub().returns('newValue');

      const params = {
        cell: 'cellValue',
        header: 'TEST',
        rowIndex: 0,
        row,
        staticHeader: 'TEST'
      };

      const headerConfig = {
        setCellValue: setCellValueStub
      };

      const mutableRows = [row];

      executeSetCellValue(params, headerConfig, mutableRows);

      expect(setCellValueStub).to.have.been.calledOnceWithExactly(params);
      expect(mutableRows).to.deep.equal([{ TEST: 'newValue' }]);
    });

    it('should remap the key for a static header alias', () => {
      const row = { TEST: 'cellValue' };

      const setCellValueStub = sinon.stub().returns('newValue');

      const params = {
        cell: 'cellValue',
        header: 'TEST',
        rowIndex: 0,
        row,
        staticHeader: 'NEW_KEY'
      };

      const headerConfig = {
        setCellValue: setCellValueStub
      };

      const mutableRows = [row];

      executeSetCellValue(params, headerConfig, mutableRows);

      expect(setCellValueStub).to.have.been.calledOnceWithExactly(params);
      expect(mutableRows).to.deep.equal([{ NEW_KEY: 'newValue' }]);
    });
  });
});
