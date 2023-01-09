import Ajv from 'ajv';
import { expect } from 'chai';
import { describe } from 'mocha';
import { transformationConfigJSONSchema } from './xlsx-transform-schema';

describe('transformationJSONSchema', () => {
  const ajv = new Ajv();

  it('is valid json schema', () => {
    expect(ajv.validateSchema(transformationConfigJSONSchema)).to.be.true;
  });
});
