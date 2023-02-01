import { expect } from 'chai';
import { describe } from 'mocha';
import xlsx from 'xlsx';
import { SUBMISSION_MESSAGE_TYPE } from '../../../../constants/status';
import { CSVWorksheet } from '../csv-file';
import {
  FileColumnUniqueValidatorConfig,
  getCodeValueFieldsValidator,
  getNumericFieldsValidator,
  getRequiredFieldsValidator,
  getUniqueColumnsValidator,
  getValidFormatFieldsValidator,
  getValidRangeFieldsValidator
} from './csv-row-validator';

describe('getRequiredFieldsValidator', () => {
  it('adds no errors when required fields are populated', () => {
    const requiredColumnsConfig = {
      columnName: 'Header1'
    };

    const validator = getRequiredFieldsValidator(requiredColumnsConfig);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([
      ['Header1', 'Header2'],
      ['Header1Data', 'Header2Data']
    ]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([]);
  });

  it('adds no errors when header does not exist', () => {
    const requiredColumnsConfig = {
      columnName: 'Header1'
    };

    const validator = getRequiredFieldsValidator(requiredColumnsConfig);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([[], [5]]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([]);
  });

  it('adds no errors if there are zero rows in the worksheet', () => {
    const requiredColumnsConfig = {
      columnName: 'Header1'
    };

    const validator = getRequiredFieldsValidator(requiredColumnsConfig);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1', 'Header2']]); // no data rows

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([]);
  });

  it('adds errors for required fields that are empty', () => {
    const requiredColumnsConfig = {
      columnName: 'Header1'
    };

    const validator = getRequiredFieldsValidator(requiredColumnsConfig);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([
      ['Header1', 'Header2', 'Header3'],
      ['', 'Header2Data', ''] // mixture of required and non required headers with non-empty and empty values
    ]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([
      {
        col: 'Header1',
        errorCode: SUBMISSION_MESSAGE_TYPE.MISSING_REQUIRED_FIELD,
        message: 'Value is required and cannot be empty',
        row: 2
      }
    ]);
  });

  it('adds no errors if there are no empty required fields', () => {
    const requiredColumnsConfig = {
      columnName: 'Header1'
    };

    const validator = getRequiredFieldsValidator(requiredColumnsConfig);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([
      ['Header1', 'Header2', 'Header3'],
      ['header1Data', 'Header2Data', ''] // valid fields
    ]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([]);
  });
});

describe('getCodeValueFieldsValidator', () => {
  it('adds no errors when header does not exist', () => {
    const requiredCodeValuesByHeader = {
      columnName: 'Header1',
      column_code_validator: { allowed_code_values: [{ name: 'Code1' }, { name: 'Code2' }] }
    };

    const validator = getCodeValueFieldsValidator(requiredCodeValuesByHeader);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([[], [5]]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([]);
  });

  it('adds no errors when code values are empty', () => {
    const requiredCodeValuesByHeader = {
      columnName: 'Header1',
      column_code_validator: { allowed_code_values: [] }
    };

    const validator = getCodeValueFieldsValidator(requiredCodeValuesByHeader);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([[], [5]]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([]);
  });
  it('adds no errors when no required code values are provided', () => {
    const requiredCodeValuesByHeader = undefined;

    const validator = getCodeValueFieldsValidator(requiredCodeValuesByHeader);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([
      ['Header1', 'Header2'],
      ['Header1Data', 'Header2Data']
    ]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([]);
  });

  it('adds errors for non-empty fields whose value is not part of a specified code set', () => {
    const requiredCodeValuesByHeader = {
      columnName: 'Header1',
      column_code_validator: { allowed_code_values: [{ name: 'Code1' }, { name: 'Code2' }] }
    };

    const validator = getCodeValueFieldsValidator(requiredCodeValuesByHeader);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([
      ['Header1', 'Header2'],
      ['invalidCode', 'Header2Data'] // non-empty field does not match one of the valid codes
    ]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([
      {
        col: 'Header1',
        errorCode: SUBMISSION_MESSAGE_TYPE.INVALID_VALUE,
        message: 'Invalid value: invalidCode. Must be one of [Code1, Code2]',
        row: 2
      }
    ]);
  });

  it('adds no errors for empty fields whose value is not part of a specified code set', () => {
    const requiredCodeValuesByHeader = {
      columnName: 'Header1',
      column_code_validator: { allowed_code_values: [{ name: 'Code1' }, { name: 'Code2' }] }
    };

    const validator = getCodeValueFieldsValidator(requiredCodeValuesByHeader);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([
      ['Header1', 'Header2'],
      ['', 'Header2Data'] // empty field does not match one of the valid codes
    ]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([]);
  });

  it('adds no errors for fields whose value is part of a specified code set', () => {
    const requiredCodeValuesByHeader = {
      columnName: 'Header1',
      column_code_validator: { allowed_code_values: [{ name: 'Code1' }, { name: 'Code2' }] }
    };

    const validator = getCodeValueFieldsValidator(requiredCodeValuesByHeader);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([
      ['Header1', 'Header2'],
      ['Code1', 'Code4'] // fields that match one of the valid codes
    ]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([]);
  });
});

describe('getValidRangeFieldsValidator', () => {
  it('adds no errors when no code value range is not provided', () => {
    const codeValuesRangeByHeader = undefined;

    const validator = getValidRangeFieldsValidator(codeValuesRangeByHeader);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1'], []]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([]);
  });

  it('adds no errors when header does not exist', () => {
    const codeValuesRangeByHeader = {
      columnName: 'Header1',
      column_range_validator: {
        min_value: 1,
        max_value: 10
      }
    };

    const validator = getValidRangeFieldsValidator(codeValuesRangeByHeader);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([[], [5]]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([]);
  });

  it('adds no errors when valid value range is provided', () => {
    const codeValuesRangeByHeader = {
      columnName: 'Header1',
      column_range_validator: {
        min_value: 1,
        max_value: 10
      }
    };

    const validator = getValidRangeFieldsValidator(codeValuesRangeByHeader);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1'], [6]]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([]);
  });

  it('adds an out of range error when value provided exceeds range', () => {
    const codeValuesRangeByHeader = {
      columnName: 'Header1',
      column_range_validator: {
        min_value: 1,
        max_value: 10
      }
    };

    const validator = getValidRangeFieldsValidator(codeValuesRangeByHeader);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1'], [11]]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([
      {
        col: 'Header1',
        errorCode: SUBMISSION_MESSAGE_TYPE.OUT_OF_RANGE,
        message: 'Invalid value: 11. Value must be between 1 and 10 ',
        row: 2
      }
    ]);
  });

  it('adds an out of range error when value provided is less than the range', () => {
    const codeValuesRangeByHeader = {
      columnName: 'Header1',
      column_range_validator: {
        min_value: 5,
        max_value: 10
      }
    };

    const validator = getValidRangeFieldsValidator(codeValuesRangeByHeader);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1'], [1]]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([
      {
        col: 'Header1',
        errorCode: SUBMISSION_MESSAGE_TYPE.OUT_OF_RANGE,
        message: 'Invalid value: 1. Value must be between 5 and 10 ',
        row: 2
      }
    ]);
  });

  it('adds an out of range error when value provided is greater than the max_value, and only max_value is provided', () => {
    const codeValuesRangeByHeader = {
      columnName: 'Header1',
      column_range_validator: {
        max_value: 10
      }
    };

    const validator = getValidRangeFieldsValidator(codeValuesRangeByHeader);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1'], [11]]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([
      {
        col: 'Header1',
        errorCode: SUBMISSION_MESSAGE_TYPE.OUT_OF_RANGE,
        message: 'Invalid value: 11. Value must be less than 10 ',
        row: 2
      }
    ]);
  });

  it('adds an out of range error when value provided is less than the min_value, and only the min-value is specified', () => {
    const codeValuesRangeByHeader = {
      columnName: 'Header1',
      column_range_validator: {
        min_value: 5
      }
    };

    const validator = getValidRangeFieldsValidator(codeValuesRangeByHeader);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1'], [4]]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([
      {
        col: 'Header1',
        errorCode: SUBMISSION_MESSAGE_TYPE.OUT_OF_RANGE,
        message: 'Invalid value: 4. Value must be greater than 5 ',
        row: 2
      }
    ]);
  });

  it('adds an invalid value error when value provided is not a number', () => {
    const codeValuesRangeByHeader = {
      columnName: 'Header1',
      column_range_validator: {
        min_value: 5,
        max_vlaue: 10
      }
    };

    const validator = getValidRangeFieldsValidator(codeValuesRangeByHeader);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1'], ['a']]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([
      {
        col: 'Header1',
        errorCode: SUBMISSION_MESSAGE_TYPE.INVALID_VALUE,
        message: 'Invalid value: a. Value must be a number ',
        row: 2
      }
    ]);
  });
});

describe('getNumericFieldsValidator', () => {
  it('adds no errors when configuration is not provided', () => {
    const columnNumericValidatorConfig = undefined;

    const validator = getNumericFieldsValidator(columnNumericValidatorConfig);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1'], []]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([]);
  });

  it('adds no errors when header does not exist', () => {
    const columnNumericValidatorConfig = {
      columnName: 'Header 1',
      column_numeric_validator: {}
    };

    const validator = getNumericFieldsValidator(columnNumericValidatorConfig);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([[], [5]]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([]);
  });

  it('adds an error when row value is not numeric', () => {
    const columnNumericValidatorConfig = {
      columnName: 'Header1',
      column_numeric_validator: {}
    };

    const validator = getNumericFieldsValidator(columnNumericValidatorConfig);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1'], ['a']]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([
      {
        col: 'Header1',
        errorCode: SUBMISSION_MESSAGE_TYPE.INVALID_VALUE,
        message: 'Invalid value: a. Value must be a number ',
        row: 2
      }
    ]);
  });
});

describe('getValidFormatFieldsValidator', () => {
  it('adds no errors when configuration is not provided', () => {
    const columnFormatValidatorConfig = undefined;

    const validator = getValidFormatFieldsValidator(columnFormatValidatorConfig);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1'], ['WPT1']]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([]);
  });

  it('adds no errors when regular expression is not provided', () => {
    const columnFormatValidatorConfig = {
      columnName: 'Header1',
      column_format_validator: {
        reg_exp: '',
        expected_format: ''
      }
    };

    const validator = getValidFormatFieldsValidator(columnFormatValidatorConfig);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1'], ['WPT1']]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([]);
  });

  it('adds no errors when header is not provided', () => {
    const columnFormatValidatorConfig = {
      columnName: 'Header1',
      column_format_validator: {
        reg_exp: '^wpt \\d+$',
        expected_format: ''
      }
    };

    const validator = getValidFormatFieldsValidator(columnFormatValidatorConfig);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header2'], ['WPT1']]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([]);
  });

  it('adds no errors when row value matches regular expression because regex is case insensitive', () => {
    const columnFormatValidatorConfig = {
      columnName: 'Header1',
      column_format_validator: {
        reg_exp: '^wpt \\d+$',
        reg_exp_flags: 'i',
        expected_format: ''
      }
    };

    const validator = getValidFormatFieldsValidator(columnFormatValidatorConfig);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1'], ['WPT 1']]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([]);
  });

  it('adds an error when row value does not match regular expression because regex is case sensitive', () => {
    const columnFormatValidatorConfig = {
      columnName: 'Header1',
      column_format_validator: {
        reg_exp: '^wpt \\d+$',
        expected_format: 'Must be in the format "WPT X": WPT 11 (case sensitive)'
      }
    };

    const validator = getValidFormatFieldsValidator(columnFormatValidatorConfig);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1'], ['WPT 1']]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([
      {
        col: 'Header1',
        errorCode: SUBMISSION_MESSAGE_TYPE.UNEXPECTED_FORMAT,
        message: 'Unexpected Format: WPT 1. Must be in the format "WPT X": WPT 11 (case sensitive)',
        row: 2
      }
    ]);
  });

  it('adds an error when row value does not match regular expression', () => {
    const columnFormatValidatorConfig = {
      columnName: 'Header1',
      column_format_validator: {
        reg_exp: '^wpt \\d+$',
        expected_format: 'Must be in the format "WPT X": WPT 11 (case sensitive)'
      }
    };

    const validator = getValidFormatFieldsValidator(columnFormatValidatorConfig);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1'], ['WXT1']]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([
      {
        col: 'Header1',
        errorCode: SUBMISSION_MESSAGE_TYPE.UNEXPECTED_FORMAT,
        message: 'Unexpected Format: WXT1. Must be in the format "WPT X": WPT 11 (case sensitive)',
        row: 2
      }
    ]);
  });

  describe('getValidFormatFieldsValidator', () => {
    it('adds no errors when no config is supplied', () => {
      const validator = getUniqueColumnsValidator();
      const worksheet = xlsx.utils.aoa_to_sheet([['Header1'], ['stuff']]);
      const csvWorkSheet = new CSVWorksheet('Sheet', worksheet);

      validator(csvWorkSheet);

      expect(csvWorkSheet.csvValidation.rowErrors).to.be.empty;
    });

    it('adds no errors when no columns are specified in config', () => {
      const config: FileColumnUniqueValidatorConfig = {
        file_column_unique_validator: {
          column_names: ['']
        }
      };
      const validator = getUniqueColumnsValidator(config);
      const worksheet = xlsx.utils.aoa_to_sheet([['Header1'], ['stuff']]);
      const csvWorkSheet = new CSVWorksheet('Sheet', worksheet);

      validator(csvWorkSheet);

      expect(csvWorkSheet.csvValidation.rowErrors).to.be.empty;
    });

    it('adds no errors when specified key column is missing from the worksheet', () => {
      const config: FileColumnUniqueValidatorConfig = {
        file_column_unique_validator: {
          column_names: ['Header1', 'Header2']
        }
      };
      const validator = getUniqueColumnsValidator(config);
      const worksheet = xlsx.utils.aoa_to_sheet([['Header1'], ['stuff']]);
      const csvWorkSheet = new CSVWorksheet('Sheet', worksheet);

      validator(csvWorkSheet);

      expect(csvWorkSheet.csvValidation.rowErrors).to.be.empty;
    });

    it('adds no errors when all keys specified are unique', () => {
      const config: FileColumnUniqueValidatorConfig = {
        file_column_unique_validator: {
          column_names: ['Header1', 'Header2']
        }
      };
      const validator = getUniqueColumnsValidator(config);
      const worksheet = xlsx.utils.aoa_to_sheet([
        ['Header1', 'Header2', 'Header3'],
        [1, 2, 3],
        [2, 2, 3],
        [3, 2, 3]
      ]);
      const csvWorkSheet = new CSVWorksheet('Sheet', worksheet);

      validator(csvWorkSheet);

      expect(csvWorkSheet.csvValidation.rowErrors).to.be.empty;
    });

    it('adds errors when not all keys are unique', () => {
      const config: FileColumnUniqueValidatorConfig = {
        file_column_unique_validator: {
          column_names: ['Header1', 'Header2']
        }
      };
      const validator = getUniqueColumnsValidator(config);
      const worksheet = xlsx.utils.aoa_to_sheet([
        ['Header1', 'Header2', 'Header3'],
        [1, 2, 3],
        [2, 2, 3],
        [2, 2, 3]
      ]);
      const csvWorkSheet = new CSVWorksheet('Sheet', worksheet);

      validator(csvWorkSheet);

      expect(csvWorkSheet.csvValidation.rowErrors).to.not.be.empty;
      expect(csvWorkSheet.csvValidation.rowErrors[0].errorCode).to.be.eql(SUBMISSION_MESSAGE_TYPE.NON_UNIQUE_KEY);
    });
  });
});
