import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';

import {
  ITechniquePostData,
  ITechniqueRowDataForUpdate,
  TechniqueObject,
  TechniqueRepository
} from '../repositories/technique-repository';
import { AttractantService } from './attractants-service';
import { TechniqueAttributeService } from './technique-attributes-service';
import { TechniqueService } from './technique-service';

chai.use(sinonChai);

describe('TechniqueService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getTechniqueById', () => {
    it('should run successfully', async () => {
      const mockRecord: TechniqueObject = {
        method_technique_id: 1,
        method_lookup_id: 2,
        name: 'name',
        description: 'desc',
        distance_threshold: 200,
        attractants: [],
        attributes: {
          qualitative_attributes: [],
          quantitative_attributes: []
        }
      };

      sinon.stub(TechniqueRepository.prototype, 'getTechniqueById').resolves(mockRecord);

      const dbConnection = getMockDBConnection();

      const service = new TechniqueService(dbConnection);

      const surveyId = 1;
      const methodTechniqueId = 2;

      const response = await service.getTechniqueById(surveyId, methodTechniqueId);

      expect(response).to.eql(mockRecord);
    });
  });

  describe('getTechniquesForSurveyId', () => {
    it('should run successfully', async () => {
      const mockRecord: TechniqueObject = {
        method_technique_id: 1,
        method_lookup_id: 2,
        name: 'name',
        description: 'desc',
        distance_threshold: 200,
        attractants: [],
        attributes: {
          qualitative_attributes: [],
          quantitative_attributes: []
        }
      };

      sinon.stub(TechniqueRepository.prototype, 'getTechniquesForSurveyId').resolves([mockRecord]);

      const dbConnection = getMockDBConnection();

      const service = new TechniqueService(dbConnection);

      const surveyId = 1;
      const pagination = undefined;

      const response = await service.getTechniquesForSurveyId(surveyId, pagination);

      expect(response).to.eql([mockRecord]);
    });
  });

  describe('getTechniquesCountForSurveyId', () => {
    it('should run successfully', async () => {
      const count = 10;

      sinon.stub(TechniqueRepository.prototype, 'getTechniquesCountForSurveyId').resolves(count);

      const dbConnection = getMockDBConnection();

      const service = new TechniqueService(dbConnection);

      const surveyId = 1;

      const response = await service.getTechniquesCountForSurveyId(surveyId);

      expect(response).to.eql(count);
    });
  });

  describe('insertTechniquesForSurvey', () => {
    it('should run successfully', async () => {
      const mockRecord = { method_technique_id: 11 };

      const insertTechniqueStub = sinon.stub(TechniqueRepository.prototype, 'insertTechnique').resolves(mockRecord);
      const insertTechniqueAttractantsStub = sinon
        .stub(AttractantService.prototype, 'insertTechniqueAttractants')
        .resolves();
      const insertQualitativeAttributesForTechniqueStub = sinon
        .stub(TechniqueAttributeService.prototype, 'insertQualitativeAttributesForTechnique')
        .resolves();
      const insertQuantitativeAttributesForTechniqueStub = sinon
        .stub(TechniqueAttributeService.prototype, 'insertQuantitativeAttributesForTechnique')
        .resolves();

      const dbConnection = getMockDBConnection();

      const service = new TechniqueService(dbConnection);

      const surveyId = 1;
      const techniques: ITechniquePostData[] = [
        {
          name: 'name',
          description: 'desc',
          distance_threshold: 200,
          method_lookup_id: 2,
          attractants: [
            {
              attractant_lookup_id: 111
            }
          ],
          attributes: {
            quantitative_attributes: [
              {
                method_technique_attribute_quantitative_id: 44,
                method_lookup_attribute_quantitative_id: '123-456-55',
                value: 66
              }
            ],
            qualitative_attributes: [
              {
                method_technique_attribute_qualitative_id: 77,
                method_lookup_attribute_qualitative_id: '123-456-88',
                method_lookup_attribute_qualitative_option_id: '123-456-99'
              }
            ]
          }
        }
      ];

      const response = await service.insertTechniquesForSurvey(surveyId, techniques);

      expect(insertTechniqueStub).to.have.been.calledOnceWith(surveyId, {
        name: 'name',
        description: 'desc',
        distance_threshold: 200,
        method_lookup_id: 2
      });
      expect(insertTechniqueAttractantsStub).to.have.been.calledOnceWith(surveyId, 11, techniques[0].attractants);
      expect(insertQualitativeAttributesForTechniqueStub).to.have.been.calledOnceWith(
        11,
        techniques[0].attributes.qualitative_attributes
      );
      expect(insertQuantitativeAttributesForTechniqueStub).to.have.been.calledOnceWith(
        11,
        techniques[0].attributes.quantitative_attributes
      );

      expect(response).to.eql([mockRecord]);
    });
  });

  describe('updateTechnique', () => {
    it('should run successfully', async () => {
      const mockRecord = { method_technique_id: 1 };

      sinon.stub(TechniqueRepository.prototype, 'updateTechnique').resolves(mockRecord);

      const dbConnection = getMockDBConnection();

      const service = new TechniqueService(dbConnection);

      const surveyId = 1;
      const techniqueObject: ITechniqueRowDataForUpdate = {
        method_technique_id: 1,
        name: 'name',
        description: 'desc',
        distance_threshold: 200,
        method_lookup_id: 2
      };

      const response = await service.updateTechnique(surveyId, techniqueObject);

      expect(response).to.eql(mockRecord);
    });
  });

  describe('deleteTechnique', () => {
    it('should run successfully', async () => {
      const mockRecord = { method_technique_id: 1 };

      const deleteAllTechniqueAttractantsStub = sinon
        .stub(AttractantService.prototype, 'deleteAllTechniqueAttractants')
        .resolves();
      const deleteAllTechniqueAttributesStub = sinon
        .stub(TechniqueAttributeService.prototype, 'deleteAllTechniqueAttributes')
        .resolves();
      const deleteTechniqueStub = sinon.stub(TechniqueRepository.prototype, 'deleteTechnique').resolves(mockRecord);

      const dbConnection = getMockDBConnection();

      const service = new TechniqueService(dbConnection);

      const surveyId = 1;
      const methodTechniqueId = 2;

      const response = await service.deleteTechnique(surveyId, methodTechniqueId);

      expect(deleteAllTechniqueAttractantsStub).to.have.been.calledOnceWith(surveyId, methodTechniqueId);
      expect(deleteAllTechniqueAttributesStub).to.have.been.calledOnceWith(surveyId, methodTechniqueId);
      expect(deleteTechniqueStub).to.have.been.calledOnceWith(surveyId, methodTechniqueId);

      expect(response).to.eql(mockRecord);
    });
  });
});
