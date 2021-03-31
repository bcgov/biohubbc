import Ajv from 'ajv';
import { expect } from 'chai';
import { describe } from 'mocha';
import { rootAPIDoc } from './root-api-doc';

describe('rootAPIDoc', () => {
  const ajv = new Ajv();

  it('is valid openapi v3 schema', () => {
    expect(ajv.validateSchema(rootAPIDoc)).to.be.true;
  });
});
