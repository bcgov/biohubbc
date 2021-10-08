import jsonpath from 'jsonpath';
import { CSVValidator } from '../csv/csv-file';
import {
  getDuplicateHeadersValidator,
  getValidHeadersValidator,
  hasRecommendedHeadersValidator,
  hasRequiredHeadersValidator
} from '../csv/validation/csv-header-validator';
import {
  getCodeValueFieldsValidator,
  getRequiredFieldsValidator,
  getValidFormatFieldsValidator,
  getValidRangeFieldsValidator,
  getNumericFieldsValidator
} from '../csv/validation/csv-row-validator';
import { DWCArchiveValidator } from '../dwc/dwc-archive-file';
import { XLSXCSVValidator } from '../xlsx/xlsx-file';
import {
  getFileEmptyValidator,
  getFileMimeTypeValidator,
  getRequiredFilesValidator
} from './file-type-and-content-validator';

export const ValidationRulesRegistry = {
  registry: [
    {
      name: '',
      generator: getFileEmptyValidator
    },
    {
      name: 'mimetype_validator',
      generator: getFileMimeTypeValidator
    },
    {
      name: 'submission_required_files_validator',
      generator: getRequiredFilesValidator
    },
    {
      name: 'file_duplicate_columns_validator',
      generator: getDuplicateHeadersValidator
    },
    {
      name: 'file_required_columns_validator',
      generator: hasRequiredHeadersValidator
    },
    {
      name: 'file_recommended_columns_validator',
      generator: hasRecommendedHeadersValidator
    },
    {
      name: 'file_valid_columns_validator',
      generator: getValidHeadersValidator
    },
    {
      name: '',
      generator: getRequiredFieldsValidator
    },
    {
      name: 'column_code_validator',
      generator: getCodeValueFieldsValidator
    },
    {
      name: 'column_range_validator',
      generator: getValidRangeFieldsValidator
    },
    {
      name: 'column_format_validator',
      generator: getValidFormatFieldsValidator
    },
    {
      name: 'column_numeric_validator',
      generator: getNumericFieldsValidator
    }
  ],
  findMatchingRule(name: string): any {
    return this.registry.find((item) => item.name === name)?.generator;
  }
};

export class ValidationSchemaParser {
  validationSchema: object;

  constructor(validationSchema: string | object) {
    if (typeof validationSchema === 'string') {
      this.validationSchema = this.parseJson(validationSchema);
    } else {
      this.validationSchema = validationSchema;
    }
  }

  getSubmissionValidations(): (DWCArchiveValidator | XLSXCSVValidator)[] {
    const validationSchemas = this.getSubmissionValidationSChemas();

    const rules: (DWCArchiveValidator | XLSXCSVValidator)[] = [];

    validationSchemas.forEach((validationSchema) => {
      const keys = Object.keys(validationSchema);

      if (keys.length !== 1) {
        return;
      }

      const key = keys[0];

      const generatorFunction = ValidationRulesRegistry.findMatchingRule(key);

      if (!generatorFunction) {
        return;
      }

      const rule = generatorFunction(validationSchema);

      rules.push(rule);
    });

    return rules;
  }

  getFileValidations(fileName: string): CSVValidator[] {
    const validationSchemas = this.getFileValidationSchemas(fileName);

    const rules: CSVValidator[] = [];

    validationSchemas.forEach((validationSchema) => {
      const keys = Object.keys(validationSchema);

      if (keys.length !== 1) {
        return;
      }

      const key = keys[0];

      const generatorFunction = ValidationRulesRegistry.findMatchingRule(key);

      if (!generatorFunction) {
        return;
      }

      const rule = generatorFunction(validationSchema);

      rules.push(rule);
    });

    return rules;
  }

  getAllColumnValidations(fileName: string): CSVValidator[] {
    const columnNames = this.getColumnNames(fileName);

    let rules: CSVValidator[] = [];

    columnNames.forEach((columnName) => {
      const columnValidators = this.getColumnValidations(fileName, columnName);

      rules = rules.concat(columnValidators);
    });

    return rules;
  }

  getColumnValidations(fileName: string, columnName: string): CSVValidator[] {
    const validationSchemas = this.getColumnValidationSchemas(fileName, columnName);

    const rules: CSVValidator[] = [];

    validationSchemas.forEach((validationSchema) => {
      const keys = Object.keys(validationSchema);

      if (keys.length !== 1) {
        return;
      }

      const key = keys[0];

      const generatorFunction = ValidationRulesRegistry.findMatchingRule(key);

      if (!generatorFunction) {
        return;
      }

      const rule = generatorFunction({ columnName: columnName, ...validationSchema });

      rules.push(rule);
    });

    return rules;
  }

  getSubmissionValidationSChemas(): object[] {
    return jsonpath.query(this.validationSchema, this.getSubmissionValidationsJsonPath())?.[0] || [];
  }

  getFileValidationSchemas(fileName: string): object[] {
    let validationSchemas = jsonpath.query(this.validationSchema, this.getFileValidationsJsonPath(fileName))?.[0] || [];

    if (!validationSchemas.length) {
      validationSchemas = this.getDefaultFileValidationSchemas();
    }
    return validationSchemas;
  }

  getDefaultFileValidationSchemas(): object[] {
    return jsonpath.query(this.validationSchema, this.getDefaultFileValidationsJsonPath())?.[0] || [];
  }

  getColumnValidationSchemas(fileName: string, columnName: string): object[] {
    const filevalidationSchemas =
      jsonpath.query(this.validationSchema, this.getFileValidationsJsonPath(fileName))?.[0] || [];

    let columnValidationSchemas;

    if (!filevalidationSchemas.length) {
      columnValidationSchemas = this.getDefaultColumnValidationSchemas(columnName);
    } else {
      columnValidationSchemas =
        jsonpath.query(this.validationSchema, this.getColumnValidationsJsonpath(fileName, columnName))?.[0] || [];
    }

    return columnValidationSchemas;
  }

  getDefaultColumnValidationSchemas(columnName: string): object[] {
    return jsonpath.query(this.validationSchema, this.getDefaultColumnValidationsJsonpath(columnName))?.[0] || [];
  }

  getColumnNames(fileName: string): string[] {
    let columnNames;

    const filevalidationSchemas =
      jsonpath.query(this.validationSchema, this.getFileValidationsJsonPath(fileName))?.[0] || [];

    if (!filevalidationSchemas.length) {
      columnNames = jsonpath.query(this.validationSchema, this.getDefaultColumnNamesJsonpath());
    } else {
      columnNames = jsonpath.query(this.validationSchema, this.getColumnNamesJsonpath(fileName));
    }

    return columnNames;
  }

  getSubmissionValidationsJsonPath(): string {
    return '$.validations';
  }

  getFileValidationsJsonPath(fileName: string): string {
    return `$.files[?(@.name == '${fileName}')].validations`;
  }
  getDefaultFileValidationsJsonPath(): string {
    return `$.defaultFile.validations`;
  }

  getColumnNamesJsonpath(fileName: string): string {
    return `$.files[?(@.name == '${fileName}')].columns[*].name`;
  }

  getDefaultColumnNamesJsonpath(): string {
    return `$.defaultFile.columns[*].name`;
  }

  getColumnValidationsJsonpath(fileName: string, columnName: string): string {
    return `$.files[?(@.name == '${fileName}')].columns[?(@.name == '${columnName}')].validations`;
  }

  getDefaultColumnValidationsJsonpath(columnName: string): string {
    return `$.defaultFile.columns[?(@.name == '${columnName}')].validations`;
  }

  parseJson(json: any): object {
    try {
      return JSON.parse(json);
    } catch {
      throw Error('ValidationSchemaParser - provided json was not valid JSON');
    }
  }
}
