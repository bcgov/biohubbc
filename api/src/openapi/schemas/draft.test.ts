import Ajv from 'ajv';
import { expect } from 'chai';
import { describe } from 'mocha';
import { draftResponseObject } from './draft';

describe('draftResponseObject', () => {
  const ajv = new Ajv();

  it('is valid openapi v3 schema', () => {
    expect(ajv.validateSchema(draftResponseObject)).to.be.true;
  });
});
