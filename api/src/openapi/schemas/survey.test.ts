import Ajv from 'ajv';
import { expect } from 'chai';
import { describe } from 'mocha';
import { surveyCreatePostRequestObject, surveyIdResponseObject } from './survey';

describe('surveyCreatePostRequestObject', () => {
  const ajv = new Ajv();

  it('is valid openapi v3 schema', () => {
    expect(ajv.validateSchema(surveyCreatePostRequestObject)).to.be.true;
  });
});

describe('surveyIdResponseObject', () => {
  const ajv = new Ajv();

  it('is valid openapi v3 schema', () => {
    expect(ajv.validateSchema(surveyIdResponseObject)).to.be.true;
  });
});
