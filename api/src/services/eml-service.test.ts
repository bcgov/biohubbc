import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { EmlService } from './eml-service';

chai.use(sinonChai);

describe('EmlPackage', () => {
  describe('withEml', () => {
    // TODO
  });
  
  describe('withDataset', () => {
    // TODO
  });
  
  describe('withProject', () => {
    // TODO
  });
  
  describe('withAdditionalMetadata', () => {
    // TODO
  });
  
  describe('withRelatedProjects', () => {
    // TODO
  });
  
  describe('build', () => {
      // TODO
  });
});

describe('EmlService', () => {
  it('constructs', () => {
    const dbConnectionObj = getMockDBConnection();

    const emlService = new EmlService(dbConnectionObj);

    expect(emlService).to.be.instanceof(EmlService);
  });

  describe('buildProjectEmlPackage', () => {
    // TODO
  });

  describe('buildSurveyEmlPackage', () => {
    // TODO
  });

  describe('codes', () => {
    // TODO
  });

  describe('loadEmlDbConstants', () => {
    // TODO
  });

  describe('loadProjectSource', () => {
    // TODO
  });

  describe('loadSurveySource', () => {
    // TODO
  });

  describe('_buildEmlSection', () => {
    // TODO
  });

  describe('_buildEmlDatasetSection', () => {
    // TODO
  });

  describe('_buildProjectEmlProjectSection', () => {
    // TODO
  });

  describe('_getSurveyAdditionalMetadata', () => {
    // TODO
  });

  describe('_getProjectAdditionalMetadata', () => {
    // TODO
  });

  describe('_getDatasetCreator', () => {
    // TODO
  });

  describe('_getProjectContact', () => {
    // TODO
  });

  describe('_getProjectPersonnel', () => {
    // TODO
  });

  describe('_getSurveyPersonnel', () => {
    // TODO
  });

  describe('_getProjectFundingSources', () => {
    // TODO
  });

  describe('_getSurveyFundingSources', () => {
    // TODO
  });

  describe('_getProjectTemporalCoverage', () => {
    // TODO
  });

  describe('_getSurveyTemporalCoverage', () => {
    // TODO
  });

  describe('_makeEmlDateString', () => {
    // TODO
  });

  describe('_makePolygonFeatures', () => {
    // TODO
  });

  describe('_makeDatasetGPolygons', () => {
    // TODO
  });

  describe('_getProjectGeographicCoverage', () => {
    // TODO
  });

  describe('_getSurveyGeographicCoverage', () => {
    // TODO
  });

  describe('_getSurveyFocalTaxonomicCoverage', () => {
    // TODO
  });

  describe('_getSurveyDesignDescription', () => {
    // TODO
  });

  describe('_buildAllSurveyEmlProjectSections', () => {
    // TODO
  });

  describe('_buildSurveyEmlProjectSection', () => {
    // TODO
  });
});
