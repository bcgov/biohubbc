import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { TechniqueVantageRepository } from '../repositories/technique-vantage-repository';
import { TechniqueVantageService } from './technique-vantage-service';

chai.use(sinonChai);

describe('TechniqueVantageService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('insertVantagesForTechnique', () => {
    it('should insert vantages successfully', async () => {
      const surveyId = 1;
      const methodTechniqueId = 2;
      const vantageMethods = [
        { vantage_method_id: 101, description: 'Mode 1' },
        { vantage_method_id: 102, description: 'Mode 2' }
      ];

      const mockInsertResponse = [{ method_technique_vantage_id: 1 }, { method_technique_vantage_id: 2 }];
      const insertVantagesStub = sinon
        .stub(TechniqueVantageRepository.prototype, 'insertVantagesForTechnique')
        .resolves(mockInsertResponse);

      const dbConnection = getMockDBConnection();
      const service = new TechniqueVantageService(dbConnection);

      const response = await service.insertVantagesForTechnique(surveyId, methodTechniqueId, vantageMethods);

      expect(response).to.eql(mockInsertResponse);
      expect(insertVantagesStub).to.have.been.calledOnceWith(surveyId, methodTechniqueId, vantageMethods);
    });

    it('should handle empty vantages gracefully', async () => {
      const surveyId = 1;
      const methodTechniqueId = 2;
      const vantageMethods: any[] = [];

      const dbConnection = getMockDBConnection();
      const techniqueVantageService = new TechniqueVantageService(dbConnection);

      const response = await techniqueVantageService.insertVantagesForTechnique(
        surveyId,
        methodTechniqueId,
        vantageMethods
      );

      expect(response).to.be.undefined;
    });
  });

  describe('updateVantagesForTechnique', () => {
    it('should update vantages successfully', async () => {
      const surveyId = 1;
      const methodTechniqueId = 2;
      const mockVantageMethods = [{ vantage_method_id: 101 }];

      const existingVantages = [
        {
          method_technique_vantage_id: 2,
          vantage_method_id: 102,
          vantage_category_id: 1
        }
      ];

      sinon.stub(TechniqueVantageRepository.prototype, 'getVantagesForTechnique').resolves(existingVantages);

      const deleteVantagesStub = sinon
        .stub(TechniqueVantageRepository.prototype, 'deleteVantagesForTechnique')
        .resolves();
      const insertVantagesStub = sinon
        .stub(TechniqueVantageRepository.prototype, 'insertVantagesForTechnique')
        .resolves();

      const dbConnection = getMockDBConnection();
      const techniqueVantageService = new TechniqueVantageService(dbConnection);

      await techniqueVantageService.updateVantagesForTechnique(surveyId, methodTechniqueId, mockVantageMethods);

      expect(deleteVantagesStub).to.have.been.calledOnceWith(surveyId, methodTechniqueId, [{ vantage_method_id: 102 }]);
      expect(insertVantagesStub).to.have.been.calledOnceWith(surveyId, methodTechniqueId, [{ vantage_method_id: 101 }]);
    });

    it('should not update if no changes in vantages', async () => {
      const surveyId = 1;
      const methodTechniqueId = 2;
      const vantageMethods = [{ vantage_method_id: 101 }, { vantage_method_id: 102 }];

      const existingVantages = [
        {
          method_technique_vantage_id: 1,
          vantage_method_id: 101,
          vantage_category_id: 2
        },
        {
          method_technique_vantage_id: 2,
          vantage_method_id: 102,
          vantage_category_id: 1
        }
      ];

      sinon.stub(TechniqueVantageRepository.prototype, 'getVantagesForTechnique').resolves(existingVantages);
      const deleteVantagesStub = sinon.stub(TechniqueVantageRepository.prototype, 'deleteVantagesForTechnique');
      const insertVantagesStub = sinon.stub(TechniqueVantageRepository.prototype, 'insertVantagesForTechnique');

      const dbConnection = getMockDBConnection();
      const techniqueVantageService = new TechniqueVantageService(dbConnection);

      await techniqueVantageService.updateVantagesForTechnique(surveyId, methodTechniqueId, vantageMethods);

      expect(deleteVantagesStub).to.not.have.been.called;
      expect(insertVantagesStub).to.not.have.been.called;
    });

    it('should handle empty current and new vantages gracefully', async () => {
      const surveyId = 1;
      const methodTechniqueId = 2;
      const vantageMethods: any[] = [];

      const existingVantages: any[] = [];

      sinon.stub(TechniqueVantageRepository.prototype, 'getVantagesForTechnique').resolves(existingVantages);
      const deleteVantagesStub = sinon.stub(TechniqueVantageRepository.prototype, 'deleteVantagesForTechnique');
      const insertVantagesStub = sinon.stub(TechniqueVantageRepository.prototype, 'insertVantagesForTechnique');

      const dbConnection = getMockDBConnection();
      const techniqueVantageService = new TechniqueVantageService(dbConnection);

      await techniqueVantageService.updateVantagesForTechnique(surveyId, methodTechniqueId, vantageMethods);

      expect(deleteVantagesStub).to.not.have.been.called;
      expect(insertVantagesStub).to.not.have.been.called;
    });
  });

  describe('deleteAllVantagesForTechnique', () => {
    it('should delete all vantages for a technique successfully', async () => {
      const surveyId = 1;
      const methodTechniqueId = 2;

      const deleteAllVantagesStub = sinon
        .stub(TechniqueVantageRepository.prototype, 'deleteAllVantagesForTechnique')
        .resolves();

      const dbConnection = getMockDBConnection();
      const techniqueVantageService = new TechniqueVantageService(dbConnection);

      const response = await techniqueVantageService.deleteAllVantagesForTechnique(surveyId, methodTechniqueId);

      expect(deleteAllVantagesStub).to.have.been.calledOnceWith(surveyId, methodTechniqueId);
      expect(response).to.be.undefined;
    });
  });
});
