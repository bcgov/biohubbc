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
  getValidRangeFieldsValidator
} from '../csv/validation/csv-row-validator';
import { DWCArchiveValidator } from '../dwc/dwc-archive-file';
import { XLSXCSVValidator } from '../xlsx/xlsx-file';
import {
  getFileEmptyValidator,
  getFileMimeTypeValidator,
  getRequiredFilesValidator
} from './file-type-and-content-validator';

const ValidationRulesRegistry = {
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
      name: '',
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
    return jsonpath.query(this.validationSchema, this.getFileValidationsJsonPath(fileName))?.[0] || [];
  }

  getColumnValidationSchemas(fileName: string, columnName: string): { name: string; validations: [] }[] {
    return jsonpath.query(this.validationSchema, this.getColumnValidationsJsonpath(fileName, columnName))?.[0] || [];
  }

  getColumnNames(fileName: string): string[] {
    return jsonpath.query(this.validationSchema, this.getColumnNamesJsonpath(fileName));
  }

  getSubmissionValidationsJsonPath(): string {
    return '$.validations';
  }

  getFileValidationsJsonPath(fileName: string): string {
    return `$.files[?(@.name == '${fileName}')].validations`;
  }

  getColumnNamesJsonpath(fileName: string): string {
    return `$.files[?(@.name == '${fileName}')].columns[*].name`;
  }

  getColumnValidationsJsonpath(fileName: string, columnName: string): string {
    return `$.files[?(@.name == '${fileName}')].columns[?(@.name == '${columnName}')].validations`;
  }

  parseJson(json: any): object {
    let parsedJson;

    try {
      parsedJson = JSON.parse(json);
    } catch {
      throw Error('ValidationSchemaParser - provided validatioNSchema was not valid JSON');
    }

    return parsedJson;
  }
}
