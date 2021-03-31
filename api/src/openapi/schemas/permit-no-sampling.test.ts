import Ajv from 'ajv';
import { expect } from 'chai';
import { describe } from 'mocha';
import { permitNoSamplingPostBody, permitNoSamplingResponseBody } from './permit-no-sampling';

describe('permitNoSamplingPostBody', () => {
  const ajv = new Ajv();

  it('is valid openapi v3 schema', () => {
    expect(ajv.validateSchema(permitNoSamplingPostBody)).to.be.true;
  });
});

describe('permitNoSamplingResponseBody', () => {
  const ajv = new Ajv();

  it('is valid openapi v3 schema', () => {
    expect(ajv.validateSchema(permitNoSamplingResponseBody)).to.be.true;
  });
});
