import Ajv from 'ajv';
import { expect } from 'chai';
import { describe } from 'mocha';
import { projectFundingSourcePostRequestObject } from './project-funding-source';

describe('projectFundingSourcePostRequestObject', () => {
  const ajv = new Ajv();

  it('is valid openapi v3 schema', () => {
    expect(ajv.validateSchema(projectFundingSourcePostRequestObject)).to.be.true;
  });
});
