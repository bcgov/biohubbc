import { expect } from 'chai';
import { getMethodTechniqueCellValidator, getSampleSiteCellValidator } from './sample-periods-header-configs';

describe('sample-periods-header-configs', () => {
  describe('getSampleSiteCellValidator', () => {
    it('should validate a sample site cell successfully', () => {
      const sampleSites = [{ name: 'site1', survey_sample_site_id: 1 }] as any[];

      const validator = getSampleSiteCellValidator(sampleSites);

      const params = { cell: 'site1' } as any;

      const result = validator(params);

      expect(result).to.be.an('array').that.is.empty;
      expect(params.mutateCell).to.equal(1);
    });

    it('should return an error if the sample site does not exist', () => {
      const sampleSites = [{ name: 'site1', survey_sample_site_id: 1 }] as any[];

      const validator = getSampleSiteCellValidator(sampleSites);

      const result = validator({ cell: 'site2' } as any);

      expect(result[0].error).to.contain('"site2" not found');
    });
  });

  describe('getMethodTechniqueCellValidator', () => {
    it('should validate a method technique cell successfully and mutate the cell', () => {
      const methodTechniques = [{ name: 'technique1', method_technique_id: 1 }] as any[];

      const validator = getMethodTechniqueCellValidator(methodTechniques);

      const params = { cell: 'technique1', mutateCell: 'technique1' } as any;

      const result = validator(params);

      expect(result).to.be.an('array').that.is.empty;
      expect(params.mutateCell).to.equal(1);
    });

    it('should return an error if the method technique does not exist', () => {
      const methodTechniques = [{ name: 'technique1', method_technique_id: 1 }] as any[];

      const validator = getMethodTechniqueCellValidator(methodTechniques);

      const result = validator({ cell: 'technique2' } as any);

      expect(result[0].error).to.contain('"technique2" not found');
    });
  });
});
