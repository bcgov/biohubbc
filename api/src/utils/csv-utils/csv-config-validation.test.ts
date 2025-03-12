import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import xlsx, { WorkSheet } from 'xlsx';
import { updateCSVRowState } from '../../services/import-services/utils/row-state';
import { WorksheetRowIndexSymbol } from '../xlsx-utils/worksheet-utils';
import {
  executeRowValidator,
  executeSetCellValue,
  executeValidateCell,
  forEachCSVRow,
  forEachCSVRowCell,
  validateCSVHeaders,
  validateCSVWorksheet
} from './csv-config-validation';
import { CSVConfig, CSVRowState } from './csv-config-validation.interface';
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

      expect(result.errors.length).to.be.equal(0);
      expect(result.rows.length).to.be.equal(1);

      expect(result.rows[0]).to.deep.equal({
        ALIAS: 'newValue',
        DYNAMIC_HEADER: 'newDynamicValue',
        OTHER_DYNAMIC_HEADER: 'newDynamicValue',
        [CSVRowState]: undefined
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
            solution: `Add the ALIAS column to the file.`,
            header: 'ALIAS',
            values: ['ALIAS', 'ALIAS_2'],
            cell: null,
            row: 1
          }
        ],
        rows: []
      });
    });

    it('should call the row validators and return the errors early', () => {
      const validateRowStub = sinon.stub().returns([{ error: 'error', solution: 'solution' }]);

      const mockConfig: CSVConfig = {
        staticHeadersConfig: {
          ALIAS: {
            aliases: ['ALIAS_2']
          }
        },
        ignoreDynamicHeaders: true,
        rowValidators: [validateRowStub]
      };

      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([{ ALIAS: 'value' }, { ALIAS: 'value' }]);

      const result = validateCSVWorksheet(worksheet, mockConfig);

      expect(validateRowStub).to.have.been.calledTwice;
      expect(result.errors.length).to.be.equal(2);
    });

    it('should update the row state with the CSVRowState', () => {
      const mockConfig: CSVConfig = {
        staticHeadersConfig: {
          ALIAS: {
            aliases: [],
            validateCell: (params) => {
              updateCSVRowState(params.row, { stateValue: 'newValue' });

              return [];
            }
          }
        },
        ignoreDynamicHeaders: true,
        rowValidators: [
          (params) => {
            updateCSVRowState(params.row, {
              stateValue: 'value',
              rowValidatorValue: 'rowValidator',
              otherValue: 'test'
            });

            return [];
          }
        ]
      };

      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([{ ALIAS: 'value' }]);

      const result = validateCSVWorksheet(worksheet, mockConfig);

      expect(result.rows[0][CSVRowState]?.stateValue).to.equal('newValue');
      expect(result.rows[0][CSVRowState]?.rowValidatorValue).to.equal('rowValidator');
      expect(result.rows[0][CSVRowState]?.otherValue).to.equal('test');
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
          row: 1,
          error: 'No columns in the file',
          solution: 'Add column names. Did you accidentally include an empty first row above the columns?',
          values: ['ALIAS'],
          cell: null,
          header: null
        }
      ]);
    });

    it('should return an error if CSV missing row data', () => {
      const mockConfig: CSVConfig = { staticHeadersConfig: { ALIAS: { aliases: [] } }, ignoreDynamicHeaders: true };
      const worksheet: WorkSheet = { A1: { t: 's', v: 'ALIAS' }, '!ref': 'A1' };

      const result = validateCSVHeaders(worksheet, mockConfig);

      expect(result).to.deep.equal([
        {
          row: 2,
          error: 'No rows in the file',
          solution: 'Add rows. Did you accidentally import the wrong file?',
          cell: null,
          header: null,
          values: null
        }
      ]);
    });

    it('should return an error if the worksheet is missing a required header', () => {
      const mockConfig: CSVConfig = { staticHeadersConfig: { ALIAS: { aliases: [] } }, ignoreDynamicHeaders: true };
      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([{ NOT_ALIAS: 'value' }]);

      const result = validateCSVHeaders(worksheet, mockConfig);

      expect(result).to.deep.equal([
        {
          row: 1,
          error: 'A required column is missing',
          solution: `Add the ALIAS column to the file.`,
          header: 'ALIAS',
          values: ['ALIAS'],
          cell: null
        }
      ]);
    });

    it('should NOT return an error if the worksheet is missing a optional header', () => {
      const mockConfig: CSVConfig = {
        staticHeadersConfig: { ALIAS: { aliases: [], optional: true } },
        ignoreDynamicHeaders: true
      };
      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([{ NOT_ALIAS: 'value' }]);

      const result = validateCSVHeaders(worksheet, mockConfig);

      expect(result).to.deep.equal([]);
    });

    it('should return an error if the worksheet has an unknown header and dynamic headers are not ignored', () => {
      const mockConfig: CSVConfig = { staticHeadersConfig: { ALIAS: { aliases: [] } }, ignoreDynamicHeaders: false };
      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([{ ALIAS: 'alias', UNKNOWN_HEADER: 'value' }]);

      const result = validateCSVHeaders(worksheet, mockConfig);

      expect(result).to.deep.equal([
        {
          row: 1,
          error: 'An unknown column is included in the file',
          solution: `Remove the UNKNOWN_HEADER column from the file.`,
          header: 'UNKNOWN_HEADER',
          cell: null,
          values: null
        }
      ]);
    });
  });

  describe('forEachCSVRow', () => {
    it('should invoke the callback for each row in the worksheet', () => {
      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([{ TEST: 'cellValue' }, { TEST: 'cellValue2' }]);

      const callbackStub = sinon.stub();

      forEachCSVRow(
        worksheet,
        { staticHeadersConfig: { TEST: { aliases: [] } }, ignoreDynamicHeaders: true },
        callbackStub
      );

      expect(callbackStub).to.have.been.calledTwice;
    });
  });

  describe('forEachCSVRowCell', () => {
    it('should iterate over each cell in the worksheet', () => {
      const row = { TEST: 'cellValue' };

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

      forEachCSVRowCell(row, 0, config, callbackStub);

      expect(callbackStub).to.have.been.calledOnceWithExactly(
        {
          cell: 'cellValue',
          header: 'TEST',
          rowIndex: 0,
          row: { TEST: 'cellValue' },
          staticHeader: 'TEST',
          mutateCell: 'cellValue'
        },
        {
          validateCell: validateCellStub,
          setCellValue: setCellValueStub
        }
      );
    });

    it('should iterate over each cell in the worksheet when alias is used', () => {
      const row = { TEST_ALIAS: 'cellValue' };

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

      forEachCSVRowCell(row, 0, config, callbackStub);

      expect(callbackStub).to.have.been.calledOnceWithExactly(
        {
          cell: 'cellValue',
          header: 'TEST_ALIAS',
          rowIndex: 0,
          row: { TEST_ALIAS: 'cellValue' },
          staticHeader: 'TEST',
          mutateCell: 'cellValue'
        },
        {
          validateCell: validateCellStub,
          setCellValue: setCellValueStub
        }
      );
    });

    it('should iterate over dynamic cell values', () => {
      const row = { TEST_ALIAS: 'cellValue', DYNAMIC_HEADER: 'dynamicValue' };

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

      forEachCSVRowCell(row, 0, config, callbackStub);

      expect(callbackStub).to.have.been.calledTwice;

      expect(callbackStub.getCall(0).args).to.deep.equal([
        {
          cell: 'cellValue',
          header: 'TEST_ALIAS',
          rowIndex: 0,
          row: {
            TEST_ALIAS: 'cellValue',
            DYNAMIC_HEADER: 'dynamicValue'
          },
          staticHeader: 'TEST',
          mutateCell: 'cellValue'
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
          row: {
            TEST_ALIAS: 'cellValue',
            DYNAMIC_HEADER: 'dynamicValue'
          },
          staticHeader: undefined, // Dynamic headers have no static header mapping
          mutateCell: 'dynamicValue'
        },
        {
          validateCell: validateDynamicCellStub,
          setCellValue: setCellValueDynamicStub
        }
      ]);
    });
  });

  describe('executeRowValidator', () => {
    it('should call the row validator callback and return errors array', () => {
      const validateRowStub = sinon.stub().returns([{ error: 'error', solution: 'solution' }]);

      const row = { TEST: 'cellValue', [WorksheetRowIndexSymbol]: 1 };

      const rowErrors = executeRowValidator({ row, rowIndex: 0 }, validateRowStub);

      expect(validateRowStub).to.have.been.calledOnceWithExactly({ row, rowIndex: 0 });
      expect(rowErrors).to.deep.equal([
        {
          error: 'error',
          solution: 'solution',
          cell: null,
          header: null,
          row: 2,
          values: null
        }
      ]);
    });
  });
  describe('executeValidateCell', () => {
    it('should call the validateCell callback and return errors array', () => {
      const validateCellStub = sinon.stub().returns([{ error: 'error', solution: 'solution' }]);

      const params = {
        cell: 'cellValue',
        header: 'TEST',
        rowIndex: 0,
        row: { TEST: 'cellValue', [WorksheetRowIndexSymbol]: 1 },
        staticHeader: 'TEST',
        mutateCell: 'cellValue'
      };

      const errors = executeValidateCell(params, validateCellStub);
      expect(validateCellStub).to.have.been.calledOnceWithExactly(params);
      expect(errors).to.deep.equal([
        {
          error: 'error',
          solution: 'solution',
          cell: 'cellValue',
          header: 'TEST',
          row: 2,
          values: null
        }
      ]);
    });
  });

  describe('executeSetCellValue', () => {
    it('should call the setCellValue callback and return the row', () => {
      const row = { TEST: 'cellValue' };

      const setCellValueStub = sinon.stub().returns('newValue');

      const params = {
        cell: 'cellValue',
        header: 'TEST',
        rowIndex: 0,
        row,
        staticHeader: 'TEST',
        mutateCell: 'cellValue'
      };

      const { header, cell } = executeSetCellValue(params, setCellValueStub);

      expect(setCellValueStub).to.have.been.calledOnceWithExactly(params);
      expect(header).to.equal('TEST');
      expect(cell).to.equal('newValue');
    });

    it('should remap the key for a static header alias', () => {
      const row = { TEST: 'cellValue' };

      const setCellValueStub = sinon.stub().returns('newValue');

      const params = {
        cell: 'cellValue',
        header: 'TEST',
        rowIndex: 0,
        row,
        staticHeader: 'NEW_KEY',
        mutateCell: 'cellValue'
      };

      const { header, cell } = executeSetCellValue(params, setCellValueStub);

      expect(setCellValueStub).to.have.been.calledOnceWithExactly(params);
      expect(header).to.equal('NEW_KEY');
      expect(cell).to.equal('newValue');
    });
  });
});
