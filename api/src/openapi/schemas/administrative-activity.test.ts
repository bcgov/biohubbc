import Ajv from 'ajv';
import { expect } from 'chai';
import { describe } from 'mocha';
import { administrativeActivityResponseObject } from './administrative-activity';

describe('administrativeActivityResponseObject', () => {
  const ajv = new Ajv();

  it('is valid openapi v3 schema', () => {
    expect(ajv.validateSchema(administrativeActivityResponseObject)).to.be.true;
  });
});
