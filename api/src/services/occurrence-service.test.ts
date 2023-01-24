import chai, { expect } from 'chai';
import { Feature, FeatureCollection } from 'geojson';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ISpatialComponentFeaturePropertiesRow, OccurrenceRepository } from '../repositories/occurrence-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { OccurrenceService } from './occurrence-service';

chai.use(sinonChai);

describe('OccurrenceService', () => {
  afterEach(() => {
    sinon.restore();
  });

  const mockService = () => {
    const dbConnection = getMockDBConnection();
    return new OccurrenceService(dbConnection);
  };

  describe('getOccurrenceSubmission', () => {
    it('should return a post occurrence', async () => {
      const submissionId = 1;
      const repo = sinon.stub(OccurrenceRepository.prototype, 'getOccurrenceSubmission').resolves({
        occurrence_submission_id: 1,
        survey_id: 1,
        template_methodology_species_id: 1,
        source: '',
        input_key: '',
        input_file_name: '',
        output_key: '',
        output_file_name: '',
        darwin_core_source: ''
      });
      const dbConnection = getMockDBConnection();
      const service = new OccurrenceService(dbConnection);
      const response = await service.getOccurrenceSubmission(submissionId);

      expect(repo).to.be.calledOnce;
      expect(response?.occurrence_submission_id).to.be.eql(submissionId);
    });
  });

  describe('getOccurrences', () => {
    it('should return a post occurrence', async () => {
      const submissionId = 1;
      const repo = sinon.stub(OccurrenceRepository.prototype, 'getOccurrencesForView').resolves([
        {
          taxa_data: [{ associated_taxa: 'string;', vernacular_name: 'string;', submission_spatial_component_id: 1 }],
          spatial_component: {
            spatial_data: ({ features: [({ id: 1 } as unknown) as Feature] } as unknown) as FeatureCollection
          }
        }
      ]);

      const dbConnection = getMockDBConnection();
      const service = new OccurrenceService(dbConnection);
      const response = await service.getOccurrences(submissionId);

      expect(repo).to.be.calledOnce;
      expect(response).to.be.eql([
        {
          taxa_data: [{ associated_taxa: 'string;', vernacular_name: 'string;', submission_spatial_component_id: 1 }],
          spatial_data: { features: [({ id: 1 } as unknown) as Feature] }
        }
      ]);
    });
  });

  describe('updateSurveyOccurrenceSubmission', () => {
    it('should return a submission id', async () => {
      const service = mockService();
      sinon.stub(OccurrenceRepository.prototype, 'updateSurveyOccurrenceSubmissionWithOutputKey').resolves({});

      const result = await service.updateSurveyOccurrenceSubmission(1, 'file name', 'key');
      expect(result).to.be.eql({});
    });
  });

  describe('updateDWCSourceForOccurrenceSubmission', () => {
    it('should return a submission id', async () => {
      const service = mockService();
      sinon.stub(OccurrenceRepository.prototype, 'updateDWCSourceForOccurrenceSubmission').resolves(1);

      const id = await service.updateDWCSourceForOccurrenceSubmission(1, '{}');
      expect(id).to.be.eql(1);
    });
  });

  describe('findSpatialMetadataBySubmissionSpatialComponentIds', () => {
    it('should return spatial components', async () => {
      const service = mockService();
      sinon
        .stub(OccurrenceRepository.prototype, 'findSpatialMetadataBySubmissionSpatialComponentIds')
        .resolves([({ spatial_component_properties: { id: 1 } } as unknown) as ISpatialComponentFeaturePropertiesRow]);

      const id = await service.findSpatialMetadataBySubmissionSpatialComponentIds([1]);
      expect(id).to.be.eql([{ id: 1 }]);
    });
  });

  describe('deleteOccurrenceSubmission', () => {
    it('should delete all occurrence data by id', async () => {
      const service = mockService();

      const softDeleteOccurrenceSubmissionStub = sinon
        .stub(OccurrenceRepository.prototype, 'softDeleteOccurrenceSubmission')
        .resolves();
      const deleteSpatialTransformSubmissionStub = sinon
        .stub(OccurrenceRepository.prototype, 'deleteSpatialTransformSubmission')
        .resolves();
      const deleteSubmissionSpatialComponentStub = sinon
        .stub(OccurrenceRepository.prototype, 'deleteSubmissionSpatialComponent')
        .resolves([{ submission_spatial_component_id: 1 }]);

      const id = await service.deleteOccurrenceSubmission(1);

      expect(softDeleteOccurrenceSubmissionStub).to.be.calledOnce;
      expect(deleteSpatialTransformSubmissionStub).to.be.calledOnce;
      expect(deleteSubmissionSpatialComponentStub).to.be.calledOnce;
      expect(id).to.be.eql([{ submission_spatial_component_id: 1 }]);
    });
  });
});
