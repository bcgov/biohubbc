import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { TechniqueVantageRepository } from '../repositories/technique-vantage-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { TechniqueVantageService } from './technique-vantage-service';

chai.use(sinonChai);

describe('TechniqueVantageService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('insertVantageModesForTechnique', () => {
    it('should insert vantage modes successfully', async () => {
      const surveyId = 1;
      const methodTechniqueId = 2;
      const vantageModeMethods = [
        { vantage_mode_method_id: 101, description: 'Mode 1' },
        { vantage_mode_method_id: 102, description: 'Mode 2' }
      ];

      const mockInsertResponse = [{ method_technique_vantage_mode_id: 1 }, { method_technique_vantage_mode_id: 2 }];
      const insertVantageModesStub = sinon
        .stub(TechniqueVantageRepository.prototype, 'insertVantageModesForTechnique')
        .resolves(mockInsertResponse);

      const dbConnection = getMockDBConnection();
      const service = new TechniqueVantageService(dbConnection);

      const response = await service.insertVantageModesForTechnique(surveyId, methodTechniqueId, vantageModeMethods);

      expect(response).to.eql(mockInsertResponse);
      expect(insertVantageModesStub).to.have.been.calledOnceWith(surveyId, methodTechniqueId, vantageModeMethods);
    });

    it('should handle empty vantage modes gracefully', async () => {
      const surveyId = 1;
      const methodTechniqueId = 2;
      const vantageModeMethods: any[] = [];

      const dbConnection = getMockDBConnection();
      const techniqueVantageService = new TechniqueVantageService(dbConnection);

      const response = await techniqueVantageService.insertVantageModesForTechnique(
        surveyId,
        methodTechniqueId,
        vantageModeMethods
      );

      expect(response).to.be.undefined;
    });
  });

  describe('updateVantageModesForTechnique', () => {
    it('should update vantage modes successfully', async () => {
      const surveyId = 1;
      const methodTechniqueId = 2;
      const mockVantageModeMethods = [{ vantage_mode_method_id: 101 }];

      const existingVantageModes = [
        {
          method_technique_vantage_mode_id: 2,
          vantage_mode_method_id: 102,
          vantage_id: 1
        }
      ];

      sinon.stub(TechniqueVantageRepository.prototype, 'getVantageModesForTechnique').resolves(existingVantageModes);

      const deleteVantageModesStub = sinon
        .stub(TechniqueVantageRepository.prototype, 'deleteVantageModesForTechnique')
        .resolves();
      const insertVantageModesStub = sinon
        .stub(TechniqueVantageRepository.prototype, 'insertVantageModesForTechnique')
        .resolves();

      const dbConnection = getMockDBConnection();
      const techniqueVantageService = new TechniqueVantageService(dbConnection);

      await techniqueVantageService.updateVantageModesForTechnique(surveyId, methodTechniqueId, mockVantageModeMethods);

      expect(deleteVantageModesStub).to.have.been.calledOnceWith(surveyId, methodTechniqueId, [
        { vantage_mode_method_id: 102 }
      ]);
      expect(insertVantageModesStub).to.have.been.calledOnceWith(surveyId, methodTechniqueId, [
        { vantage_mode_method_id: 101 }
      ]);
    });

    it('should not update if no changes in vantage modes', async () => {
      const surveyId = 1;
      const methodTechniqueId = 2;
      const vantageModeMethods = [{ vantage_mode_method_id: 101 }, { vantage_mode_method_id: 102 }];

      const existingVantageModes = [
        {
          method_technique_vantage_mode_id: 1,
          vantage_mode_method_id: 101,
          vantage_id: 2
        },
        {
          method_technique_vantage_mode_id: 2,
          vantage_mode_method_id: 102,
          vantage_id: 1
        }
      ];

      sinon.stub(TechniqueVantageRepository.prototype, 'getVantageModesForTechnique').resolves(existingVantageModes);
      const deleteVantageModesStub = sinon.stub(TechniqueVantageRepository.prototype, 'deleteVantageModesForTechnique');
      const insertVantageModesStub = sinon.stub(TechniqueVantageRepository.prototype, 'insertVantageModesForTechnique');

      const dbConnection = getMockDBConnection();
      const techniqueVantageService = new TechniqueVantageService(dbConnection);

      await techniqueVantageService.updateVantageModesForTechnique(surveyId, methodTechniqueId, vantageModeMethods);

      expect(deleteVantageModesStub).to.not.have.been.called;
      expect(insertVantageModesStub).to.not.have.been.called;
    });

    it('should handle empty current and new vantage modes gracefully', async () => {
      const surveyId = 1;
      const methodTechniqueId = 2;
      const vantageModeMethods: any[] = [];

      const existingVantageModes: any[] = [];

      sinon.stub(TechniqueVantageRepository.prototype, 'getVantageModesForTechnique').resolves(existingVantageModes);
      const deleteVantageModesStub = sinon.stub(TechniqueVantageRepository.prototype, 'deleteVantageModesForTechnique');
      const insertVantageModesStub = sinon.stub(TechniqueVantageRepository.prototype, 'insertVantageModesForTechnique');

      const dbConnection = getMockDBConnection();
      const techniqueVantageService = new TechniqueVantageService(dbConnection);

      await techniqueVantageService.updateVantageModesForTechnique(surveyId, methodTechniqueId, vantageModeMethods);

      expect(deleteVantageModesStub).to.not.have.been.called;
      expect(insertVantageModesStub).to.not.have.been.called;
    });
  });

  describe('deleteAllVantageModesForTechnique', () => {
    it('should delete all vantage modes for a technique successfully', async () => {
      const surveyId = 1;
      const methodTechniqueId = 2;

      const deleteAllVantageModesStub = sinon
        .stub(TechniqueVantageRepository.prototype, 'deleteAllVantageModesForTechnique')
        .resolves();

      const dbConnection = getMockDBConnection();
      const techniqueVantageService = new TechniqueVantageService(dbConnection);

      const response = await techniqueVantageService.deleteAllVantageModesForTechnique(surveyId, methodTechniqueId);

      expect(deleteAllVantageModesStub).to.have.been.calledOnceWith(surveyId, methodTechniqueId);
      expect(response).to.be.undefined;
    });
  });
});
