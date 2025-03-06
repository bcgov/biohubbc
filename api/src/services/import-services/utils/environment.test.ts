import { expect } from 'chai';
import {
  isQualitativeEnvironmentStub,
  isQualitativeEnvironmentTypeDefinition,
  isQuantitativeEnvironmentStub,
  isQuantitativeEnvironmentTypeDefinition
} from './environment';

describe('environment', () => {
  describe('isQualitativeEnvironmentTypeDefinition', () => {
    it('should return true if the object is a QualitativeEnvironmentTypeDefinition', () => {
      expect(isQuantitativeEnvironmentTypeDefinition({ unit: 'a', environment_quantitative_id: '1' })).to.be.true;
    });

    it('should return false if the object is not a QualitativeEnvironmentTypeDefinition', () => {
      expect(isQuantitativeEnvironmentTypeDefinition({})).to.be.false;
      expect(isQuantitativeEnvironmentTypeDefinition({ unit: 'a' })).to.be.false;
      expect(isQuantitativeEnvironmentTypeDefinition({ environment_quantitative_id: '1' })).to.be.false;
    });
  });

  describe('isQualitativeEnvironmentTypeDefinition', () => {
    it('should return true if the object is a QualitativeEnvironmentTypeDefinition', () => {
      expect(isQualitativeEnvironmentTypeDefinition({ options: [], environment_qualitative_id: '1' })).to.be.true;
    });

    it('should return false if the object is not a QualitativeEnvironmentTypeDefinition', () => {
      expect(isQualitativeEnvironmentTypeDefinition({})).to.be.false;
      expect(isQualitativeEnvironmentTypeDefinition({ options: [] })).to.be.false;
      expect(isQualitativeEnvironmentTypeDefinition({ environment_qualitative_id: '1' })).to.be.false;
    });
  });

  describe('isQualitativeEnvironmentStub', () => {
    it('should return true if the object is a qualitative environment stub', () => {
      expect(isQualitativeEnvironmentStub({ environment_qualitative_option_id: '1', environment_qualitative_id: '1' }))
        .to.be.true;
    });

    it('should return false if the object is not a qualitative environment stub', () => {
      expect(isQualitativeEnvironmentStub({})).to.be.false;
      expect(isQualitativeEnvironmentStub({ environment_qualitative_option_id: '1' })).to.be.false;
      expect(isQualitativeEnvironmentStub({ environment_qualitative_id: '1' })).to.be.false;
    });
  });

  describe('isQuantitativeEnvironmentStub', () => {
    it('should return true if the object is a quantitative environment stub', () => {
      expect(isQuantitativeEnvironmentStub({ environment_quantitative_id: '1', value: 1 })).to.be.true;
    });

    it('should return false if the object is not a quantitative environment stub', () => {
      expect(isQuantitativeEnvironmentStub({})).to.be.false;
      expect(isQuantitativeEnvironmentStub({ environment_quantitative_id: '1' })).to.be.false;
      expect(isQuantitativeEnvironmentStub({ value: 1 })).to.be.false;
    });
  });
});
