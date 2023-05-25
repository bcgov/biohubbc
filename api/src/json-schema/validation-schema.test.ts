import Ajv from 'ajv';
import { expect } from 'chai';
import { describe } from 'mocha';
import { validationConfigJSONSchema } from './validation-schema';

describe('validationConfigJSONSchema', () => {
  const ajv = new Ajv();

  it('is valid schema', () => {
    expect(ajv.validateSchema(validationConfigJSONSchema)).to.be.true;
  });
});
