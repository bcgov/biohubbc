import Ajv from 'ajv';
import { expect } from 'chai';
import { describe } from 'mocha';
import { submissionValidationSchema } from './submission-validation';

describe.only('submissionValidationSchema', () => {
  const ajv = new Ajv();

  it('is valid schema', () => {
    expect(ajv.validateSchema(submissionValidationSchema)).to.be.true;
  });
});
