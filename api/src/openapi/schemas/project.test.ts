import Ajv from 'ajv';
import { expect } from 'chai';
import { describe } from 'mocha';
import {
  projectCreatePostRequestObject,
  projectIdResponseObject,
  projectUpdateGetResponseObject,
  projectUpdatePutRequestObject
} from './project';

describe('projectCreatePostRequestObject', () => {
  const ajv = new Ajv();

  it('is valid openapi v3 schema', () => {
    expect(ajv.validateSchema(projectCreatePostRequestObject)).to.be.true;
  });
});

describe('projectIdResponseObject', () => {
  const ajv = new Ajv();

  it('is valid openapi v3 schema', () => {
    expect(ajv.validateSchema(projectIdResponseObject)).to.be.true;
  });
});

describe('projectUpdateGetResponseObject', () => {
  const ajv = new Ajv();

  it('is valid openapi v3 schema', () => {
    expect(ajv.validateSchema(projectUpdateGetResponseObject)).to.be.true;
  });
});

describe('projectUpdatePutRequestObject', () => {
  const ajv = new Ajv();

  it('is valid openapi v3 schema', () => {
    expect(ajv.validateSchema(projectUpdatePutRequestObject)).to.be.true;
  });
});
