import { JSONPath } from 'jsonpath-plus';
import { CSVValidator, WorkBookValidator } from '../csv/csv-file';
import {
  getDuplicateHeadersValidator,
  getValidHeadersValidator,
  hasRecommendedHeadersValidator,
  hasRequiredHeadersValidator
} from '../csv/validation/csv-header-validator';
import {
  getCodeValueFieldsValidator,
  getNumericFieldsValidator,
  getRequiredFieldsValidator,
  getUniqueColumnsValidator,
  getValidFormatFieldsValidator,
  getValidRangeFieldsValidator
} from '../csv/validation/csv-row-validator';
import { DWCArchiveValidator } from '../dwc/dwc-archive-file';
import { getParentChildKeyMatchValidator } from '../xlsx/validation/xlsx-validation';
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
      name: 'workbook_parent_child_key_match_validator',
      generator: getParentChildKeyMatchValidator
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
      name: 'column_required_validator',
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
    },
    {
      name: 'file_column_unique_validator',
      generator: getUniqueColumnsValidator
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
    const validationSchemas = this.getSubmissionValidationSchemas();

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

  /**
   * Retreives all validation rules for workbooks. Workbook validations differ from submission
   * validations in that they alter the validation state of each worksheet within the workbook.
   * @returns {*} {WorkBookValidator[]} All workbook validation rules for the given submission.
   */
  getWorkbookValidations(): WorkBookValidator[] {
    const validationSchemas = this.getWorkbookValidationSchemas();

    const rules: WorkBookValidator[] = [];

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

  getSubmissionValidationSchemas(): object[] {
    return JSONPath({ json: this.validationSchema, path: this.getSubmissionValidationsJsonPath() })?.[0] || [];
  }

  getWorkbookValidationSchemas(): object[] {
    return JSONPath({ json: this.validationSchema, path: this.getWorkbookValidationsJsonPath() })?.[0] || [];
  }

  getFileValidationSchemas(fileName: string): object[] {
    let validationSchemas =
      JSONPath({ json: this.validationSchema, path: this.getFileValidationsJsonPath(fileName) })?.[0] || [];

    if (!validationSchemas.length) {
      validationSchemas = this.getDefaultFileValidationSchemas();
    }
    return validationSchemas;
  }

  getDefaultFileValidationSchemas(): object[] {
    return JSONPath({ json: this.validationSchema, path: this.getDefaultFileValidationsJsonPath() })?.[0] || [];
  }

  getColumnValidationSchemas(fileName: string, columnName: string): object[] {
    const filevalidationSchemas =
      JSONPath({ json: this.validationSchema, path: this.getFileValidationsJsonPath(fileName) })?.[0] || [];

    let columnValidationSchemas;

    if (!filevalidationSchemas.length) {
      columnValidationSchemas = this.getDefaultColumnValidationSchemas(columnName);
    } else {
      columnValidationSchemas =
        JSONPath({ json: this.validationSchema, path: this.getColumnValidationsJsonpath(fileName, columnName) })?.[0] ||
        [];
    }

    return columnValidationSchemas;
  }

  getDefaultColumnValidationSchemas(columnName: string): object[] {
    return (
      JSONPath({ json: this.validationSchema, path: this.getDefaultColumnValidationsJsonpath(columnName) })?.[0] || []
    );
  }

  getColumnNames(fileName: string): string[] {
    let columnNames;

    const filevalidationSchemas =
      JSONPath({ json: this.validationSchema, path: this.getFileValidationsJsonPath(fileName) })?.[0] || [];

    if (!filevalidationSchemas.length) {
      columnNames = JSONPath({ json: this.validationSchema, path: this.getDefaultColumnNamesJsonpath() });
    } else {
      columnNames = JSONPath({ json: this.validationSchema, path: this.getColumnNamesJsonpath(fileName) });
    }

    return columnNames;
  }

  getSubmissionValidationsJsonPath(): string {
    return '$.validations';
  }

  getWorkbookValidationsJsonPath(): string {
    return '$.workbookValidations';
  }

  getFileValidationsJsonPath(fileName: string): string {
    return `$.files[?(@.name == "${fileName}")].validations`;
  }
  getDefaultFileValidationsJsonPath(): string {
    return `$.defaultFile.validations`;
  }

  getColumnNamesJsonpath(fileName: string): string {
    return `$.files[?(@.name == "${fileName}")].columns[*].name`;
  }

  getDefaultColumnNamesJsonpath(): string {
    return `$.defaultFile.columns[*].name`;
  }

  getColumnValidationsJsonpath(fileName: string, columnName: string): string {
    return `$.files[?(@.name == "${fileName}")].columns[?(@.name == "${columnName}")].validations`;
  }

  getDefaultColumnValidationsJsonpath(columnName: string): string {
    return `$.defaultFile.columns[?(@.name == "${columnName}")].validations`;
  }

  parseJson(json: any): object {
    try {
      return JSON.parse(json);
    } catch {
      throw Error('ValidationSchemaParser - provided json was not valid JSON');
    }
  }
}
