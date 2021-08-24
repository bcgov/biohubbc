import xlsx from 'xlsx';
import { expect } from 'chai';
import { describe } from 'mocha';
import { CSVWorksheet } from '../csv-file';
import { getCodeValueFieldsValidator, getRequiredFieldsValidator, ICodeValuesByHeader } from './csv-row-validator';

describe('getRequiredFieldsValidator', () => {
  it('adds no errors when required fields are not provided', () => {
    const requiredFieldsByHeader: string[] = [];

    const validator = getRequiredFieldsValidator(requiredFieldsByHeader);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([
      ['Header1', 'Header2'],
      ['Header1Data', 'Header2Data']
    ]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([]);
  });

  it('adds errors for every field if required fields are provided and there are zero data rows in the worksheet', () => {
    const requiredFieldsByHeader: string[] = ['Header1', 'Header2']; // fields for these headers are required

    const validator = getRequiredFieldsValidator(requiredFieldsByHeader);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1', 'Header2']]); // no data rows

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([
      {
        error_code: 'MissingRequiredField',
        message: 'Missing required value for column: Header1',
        row: 2,
        type: 'Missing'
      },
      {
        error_code: 'MissingRequiredField',
        message: 'Missing required value for column: Header2',
        row: 2,
        type: 'Missing'
      }
    ]);
  });

  it('adds errors for required fields that are empty', () => {
    const requiredFieldsByHeader: string[] = ['Header1', 'Header2']; // fields for these headers are required

    const validator = getRequiredFieldsValidator(requiredFieldsByHeader);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([
      ['Header1', 'Header2', 'Header3'],
      ['', 'Header2Data', ''] // mixture of required and non required headers with non-empty and empty values
    ]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([
      {
        error_code: 'MissingRequiredField',
        message: 'Missing required value for column: Header1',
        row: 2,
        type: 'Missing'
      }
    ]);
  });

  it('adds no errors if there are no invalid required fields', () => {
    const requiredFieldsByHeader: string[] = ['Header1', 'Header2']; // fields for these headers are required

    const validator = getRequiredFieldsValidator(requiredFieldsByHeader);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([
      ['Header1', 'Header2', 'Header3'],
      ['header2Data', 'Header2Data', ''] // valid fields
    ]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([]);
  });
});

describe('getCodeValueFieldsValidator', () => {
  it('adds no errors when no required code values are not provided', () => {
    const requiredCodeValuesByHeader: ICodeValuesByHeader[] = [];

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
    const requiredCodeValuesByHeader: ICodeValuesByHeader[] = [{ codeValues: ['Code1', 'Code2'], header: 'Header1' }];

    const validator = getCodeValueFieldsValidator(requiredCodeValuesByHeader);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([
      ['Header1', 'Header2'],
      ['invalidCode', 'Header2Data'] // non-empty field does not match one of the valid codes
    ]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([
      {
        error_code: 'MissingRequiredField',
        message: 'Invalid value: invalidCode. Must be one of [Code1, Code2], for column: Header1',
        row: 2,
        type: 'Missing'
      }
    ]);
  });

  it('adds no errors for empty fields whose value is not part of a specified code set', () => {
    const requiredCodeValuesByHeader: ICodeValuesByHeader[] = [{ codeValues: ['Code1', 'Code2'], header: 'Header1' }];

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
    const requiredCodeValuesByHeader: ICodeValuesByHeader[] = [
      { codeValues: ['Code1', 'Code2'], header: 'Header1' },
      { codeValues: ['Code3', 'Code4'], header: 'Header2' }
    ];

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
