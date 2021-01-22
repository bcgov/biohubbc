import { expect } from 'chai';
import { isValidJSONSchema, IValidationResult } from './template-utils';

describe('isValidJSONSchema', () => {
  describe('with an invalid schema', () => {
    const jsonSchema = {
      title: 'An Invalid JSONSchema',
      type: 'object',
      properties: {
        property: {
          type: 'not_a_real_type'
        }
      }
    };

    let validationResult: IValidationResult;

    before(() => {
      validationResult = isValidJSONSchema(jsonSchema);
    });

    it('isValid is false', () => {
      expect(validationResult.isValid).to.be.false;
    });

    it('errors is an array', () => {
      expect(validationResult.errors).to.be.an('array');
    });
  });

  describe('with a valid schema', () => {
    const jsonSchema = {
      title: 'An Invalid JSONSchema',
      type: 'object',
      properties: {
        property: {
          type: 'integer'
        }
      }
    };

    let validationResult: IValidationResult;

    before(() => {
      validationResult = isValidJSONSchema(jsonSchema);
    });

    it('isValid is true', () => {
      expect(validationResult.isValid).to.be.true;
    });

    it('errors is null', () => {
      expect(validationResult.errors).to.be.null;
    });
  });
});
