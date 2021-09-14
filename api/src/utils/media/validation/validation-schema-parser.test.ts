import { expect } from 'chai';
import { describe } from 'mocha';
import { getFileMimeTypeValidator } from './file-type-and-content-validator';
import { ValidationRulesRegistry, ValidationSchemaParser } from './validation-schema-parser';

const sampleValidationSchema = {
  files: [
    {
      name: 'testFile1',
      columns: [
        {
          name: 'column1',
          validations: [
            {
              column_code_validator: {}
            },
            {
              not_a_known_validator: {}
            }
          ]
        },
        {
          name: 'column2',
          validations: [
            {
              column_format_validator: {}
            },
            {
              column_range_validator: {}
            }
          ]
        }
      ],
      validations: [
        {
          file_duplicate_columns_validator: {}
        },
        {
          file_required_columns_validator: {}
        },
        {
          not_a_known_validator: {}
        }
      ]
    },
    {
      name: 'testFile2',
      columns: [
        {
          name: 'column3',
          validations: []
        },
        {
          name: 'column4',
          validations: []
        }
      ],
      validations: []
    }
  ],
  validations: [
    {
      mimetype_validator: {}
    },
    {
      submission_required_files_validator: {}
    },
    {
      not_a_known_validator: {}
    }
  ]
};

describe('ValidationRulesRegistry', () => {
  describe('findMatchingRule', () => {
    it('returns a generator function for a known rule', () => {
      const rule = ValidationRulesRegistry.findMatchingRule('mimetype_validator');

      expect(rule).to.eql(getFileMimeTypeValidator);
    });

    it('returns undefined for an unknown rule', () => {
      const rule = ValidationRulesRegistry.findMatchingRule('not_a_known_rule');

      expect(rule).to.equal(undefined);
    });
  });
});

describe('ValidationSchemaParser', () => {
  it('constructs', () => {
    const validationSchemaParser = new ValidationSchemaParser({});

    expect(validationSchemaParser).not.to.be.null;
  });

  describe('getSubmissionValidations', () => {
    it('returns an array of validator functions', () => {
      const validationSchemaParser = new ValidationSchemaParser(sampleValidationSchema);

      const validators = validationSchemaParser.getSubmissionValidations();

      expect(validators.length).to.equal(2);

      expect(typeof validators[0]).to.equal('function');
      expect(typeof validators[1]).to.equal('function');
    });
  });

  describe('getFileValidations', () => {
    it('returns an array of validator functions', () => {
      const validationSchemaParser = new ValidationSchemaParser(sampleValidationSchema);

      const validators = validationSchemaParser.getFileValidations('testFile1');

      expect(validators.length).to.equal(2);

      expect(typeof validators[0]).to.equal('function');
      expect(typeof validators[1]).to.equal('function');
    });
  });

  describe('getAllColumnValidations', () => {
    it('returns an array of validator functions', () => {
      const validationSchemaParser = new ValidationSchemaParser(sampleValidationSchema);

      const validators = validationSchemaParser.getAllColumnValidations('testFile1');

      expect(validators.length).to.equal(3);

      expect(typeof validators[0]).to.equal('function');
      expect(typeof validators[1]).to.equal('function');
      expect(typeof validators[2]).to.equal('function');
    });
  });

  describe('getColumnValidations', () => {
    it('returns an array of validator functions', () => {
      const validationSchemaParser = new ValidationSchemaParser(sampleValidationSchema);

      const validators = validationSchemaParser.getColumnValidations('testFile1', 'column1');

      expect(validators.length).to.equal(1);

      expect(typeof validators[0]).to.equal('function');
    });
  });

  describe('getSubmissionValidationSchemas', () => {
    it('returns an array of validation schemas', () => {
      const validationSchemaParser = new ValidationSchemaParser(sampleValidationSchema);

      const validationSchemas = validationSchemaParser.getSubmissionValidationSChemas();

      expect(validationSchemas).to.eql([
        { mimetype_validator: {} },
        { submission_required_files_validator: {} },
        { not_a_known_validator: {} }
      ]);
    });
  });

  describe('getFileValidationSchemas', () => {
    it('returns an array of validation schemas', () => {
      const validationSchemaParser = new ValidationSchemaParser(sampleValidationSchema);

      const validationSchemas = validationSchemaParser.getFileValidationSchemas('testFile1');

      expect(validationSchemas).to.eql([
        { file_duplicate_columns_validator: {} },
        { file_required_columns_validator: {} },
        { not_a_known_validator: {} }
      ]);
    });
  });

  describe('getColumnValidationSchemas', () => {
    it('returns an array of validation schemas', () => {
      const validationSchemaParser = new ValidationSchemaParser(sampleValidationSchema);

      const validationSchemas = validationSchemaParser.getColumnValidationSchemas('testFile1', 'column1');

      expect(validationSchemas).to.eql([{ column_code_validator: {} }, { not_a_known_validator: {} }]);
    });
  });

  describe('getColumnNames', () => {
    it('returns an array of column names', () => {
      const validationSchemaParser = new ValidationSchemaParser(sampleValidationSchema);

      const columnNames = validationSchemaParser.getColumnNames('testFile1');

      expect(columnNames).to.eql(['column1', 'column2']);
    });
  });

  describe('getSubmissionValidationsJsonPath', () => {
    it('returns a json path string', () => {
      const validationSchemaParser = new ValidationSchemaParser({});

      const jsonPath = validationSchemaParser.getSubmissionValidationsJsonPath();

      expect(jsonPath).to.equal('$.validations');
    });
  });

  describe('getFileValidationsJsonPath', () => {
    it('returns a json path string', () => {
      const validationSchemaParser = new ValidationSchemaParser({});

      const jsonPath = validationSchemaParser.getFileValidationsJsonPath('testName');

      expect(jsonPath).to.equal("$.files[?(@.name == 'testName')].validations");
    });
  });

  describe('getColumnNamesJsonpath', () => {
    it('returns a json path string', () => {
      const validationSchemaParser = new ValidationSchemaParser({});

      const jsonPath = validationSchemaParser.getColumnNamesJsonpath('testName');

      expect(jsonPath).to.equal("$.files[?(@.name == 'testName')].columns[*].name");
    });
  });

  describe('getColumnValidationsJsonpath', () => {
    it('returns a json path string', () => {
      const validationSchemaParser = new ValidationSchemaParser({});

      const jsonPath = validationSchemaParser.getColumnValidationsJsonpath('testName', 'columnName');

      expect(jsonPath).to.equal("$.files[?(@.name == 'testName')].columns[?(@.name == 'columnName')].validations");
    });
  });

  describe('parseJson', () => {
    it('parses a provided json string and returns a json object', () => {
      const validationSchemaParser = new ValidationSchemaParser({});

      const str = '{"test":123}';

      const json = validationSchemaParser.parseJson(str);

      expect(json).to.eql({ test: 123 });
    });

    it('throws an error if the provided json is invalid', () => {
      const validationSchemaParser = new ValidationSchemaParser({});

      const str = 'not a json string';

      try {
        validationSchemaParser.parseJson(str);
      } catch (error) {
        expect((error as Error).message).to.equal('ValidationSchemaParser - provided json was not valid JSON');
      }
    });
  });
});
