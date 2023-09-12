import sinon from "sinon";
import { getMockDBConnection } from "../__mocks__/db";
import { SiteSelectionStrategyRepository, SurveyStratum, SurveyStratumRecord } from "../repositories/site-selection-strategy-repository";
import { SiteSelectionStrategyService } from "./site-selection-strategy-service";
import { expect } from "chai";

describe('SiteSelectionStrategyService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getSiteSelectionDataBySurveyId', () => {
    it('should return site selection data', async () => {
      const mockDbConnection = getMockDBConnection();
      const siteSelectionStrategyService = new SiteSelectionStrategyService(mockDbConnection);

      const siteSelectionStrategyRepoStub = sinon
        .stub(SiteSelectionStrategyRepository.prototype, 'getSiteSelectionDataBySurveyId')
        .resolves({ strategies: ['A'], stratums: [{ name: 'A', description: 'A' } as SurveyStratumRecord]})

      const response = await siteSelectionStrategyService.getSiteSelectionDataBySurveyId(1);

      expect(siteSelectionStrategyRepoStub).to.be.calledOnceWith(1);
      expect(response).to.eql({ strategies: ['A'], stratums: [{ name: 'A', description: 'A' }] });
    });
  });

  describe('insertSurveySiteSelectionStrategies', () => {
    it('should insert site selection strategies', async () => {
      const mockDbConnection = getMockDBConnection();
      const siteSelectionStrategyService = new SiteSelectionStrategyService(mockDbConnection);

      const siteSelectionStrategyRepoStub = sinon
        .stub(SiteSelectionStrategyRepository.prototype, 'insertSurveySiteSelectionStrategies')
        .resolves()

      await siteSelectionStrategyService.insertSurveySiteSelectionStrategies(2, ['Strat1']);

      expect(siteSelectionStrategyRepoStub).to.be.calledOnceWith(2, ['Strat1']);
    });
  });

  describe('replaceSurveySiteSelectionStrategies', () => {
    it('should replace site selection strategies', async () => {
      const mockDbConnection = getMockDBConnection();
      const siteSelectionStrategyService = new SiteSelectionStrategyService(mockDbConnection);

      const strategyDeleteStub = sinon
        .stub(SiteSelectionStrategyRepository.prototype, 'deleteSurveySiteSelectionStrategies')
        .resolves()

      const strategyInsertStub = sinon
        .stub(SiteSelectionStrategyRepository.prototype, 'insertSurveySiteSelectionStrategies')
        .resolves()

      await siteSelectionStrategyService.replaceSurveySiteSelectionStrategies(3, ['Strat2']);

      expect(strategyDeleteStub).to.be.calledOnceWith(3);
      expect(strategyInsertStub).to.be.calledOnceWith(3, ['Strat2']);
    });

    it('should not insert new site selection strategies if an empty array is passed', async () => {
      const mockDbConnection = getMockDBConnection();
      const siteSelectionStrategyService = new SiteSelectionStrategyService(mockDbConnection);

      const strategyDeleteStub = sinon
        .stub(SiteSelectionStrategyRepository.prototype, 'deleteSurveySiteSelectionStrategies')
        .resolves()

      const strategyInsertStub = sinon
        .stub(SiteSelectionStrategyRepository.prototype, 'insertSurveySiteSelectionStrategies')
        .resolves()

      await siteSelectionStrategyService.replaceSurveySiteSelectionStrategies(4, []);

      expect(strategyDeleteStub).to.be.calledOnceWith(4);
      expect(strategyInsertStub).to.not.be.called;
    });
  });

  describe('insertSurveyStratums', () => {
    it('should insert survey stratums', async () => {
      const mockDbConnection = getMockDBConnection();
      const siteSelectionStrategyService = new SiteSelectionStrategyService(mockDbConnection);

      const siteSelectionStrategyRepoStub = sinon
        .stub(SiteSelectionStrategyRepository.prototype, 'insertSurveyStratums')
        .resolves()

      await siteSelectionStrategyService.insertSurveyStratums(7, [{ name: 'A', description: 'A' } as SurveyStratum]);

      expect(siteSelectionStrategyRepoStub).to.be.calledOnceWith(7, [{ name: 'A', description: 'A' }]);
    });
  });

  describe('updateSurveyStratums', () => {
    it('should update survey stratums', async () => {
      const mockDbConnection = getMockDBConnection();
      const siteSelectionStrategyService = new SiteSelectionStrategyService(mockDbConnection);

      const siteSelectionStrategyRepoStub = sinon
        .stub(SiteSelectionStrategyRepository.prototype, 'updateSurveyStratums')
        .resolves()

      await siteSelectionStrategyService.updateSurveyStratums(8, [{ name: 'B', description: 'B' } as SurveyStratumRecord]);

      expect(siteSelectionStrategyRepoStub).to.be.calledOnceWith(8, [{ name: 'B', description: 'B' }]);
    });
  });

  describe('deleteSurveyStratums', () => {
    it('should delete survey stratums', async () => {
      const mockDbConnection = getMockDBConnection();
      const siteSelectionStrategyService = new SiteSelectionStrategyService(mockDbConnection);

      const siteSelectionStrategyRepoStub = sinon
        .stub(SiteSelectionStrategyRepository.prototype, 'deleteSurveyStratums')
        .resolves()

      await siteSelectionStrategyService.deleteSurveyStratums([9]);

      expect(siteSelectionStrategyRepoStub).to.be.calledOnceWith([9]);
    });
  });

  describe('replaceSurveySiteSelectionStratums', () => {
    it('should sort stratums into insert, update and delete lists', async () => {
      // Setup
      const mockDbConnection = getMockDBConnection();
      const siteSelectionStrategyService = new SiteSelectionStrategyService(mockDbConnection);

      const stratums: Array<SurveyStratum | SurveyStratumRecord> = [
        { name: 'A', description: '' },
        { name: 'B', description: '', survey_stratum_id: 1 } as SurveyStratumRecord,
        { name: 'C', description: '' },
        { name: 'D', description: '', survey_stratum_id: 2 } as SurveyStratumRecord,
        { name: 'E', description: '' },
        { name: 'F', description: '', survey_stratum_id: 3 } as SurveyStratumRecord,
      ];

      const insertStratumStub = sinon
        .stub(SiteSelectionStrategyRepository.prototype, 'insertSurveyStratums')
        .resolves();
  
      const updateStratumStub = sinon
        .stub(SiteSelectionStrategyRepository.prototype, 'updateSurveyStratums')
        .resolves();

      const deleteStratumStub = sinon
        .stub(SiteSelectionStrategyRepository.prototype, 'deleteSurveyStratums')
        .resolves()

      sinon.stub(SiteSelectionStrategyRepository.prototype, 'getSiteSelectionDataBySurveyId')
        .resolves({
          strategies: ['Stratified'],
          stratums: [
            { name: 'B', description: '', survey_stratum_id: 1 },
            { name: 'D', description: '', survey_stratum_id: 2 },
            { name: 'F', description: '', survey_stratum_id: 3 },
            { name: 'G', description: '', survey_stratum_id: 4 },
            { name: 'H', description: '', survey_stratum_id: 5 },
          ] as SurveyStratumRecord[]
        });
      
      // Act
      await siteSelectionStrategyService.replaceSurveySiteSelectionStratums(10, stratums);

      // Assert
      expect(insertStratumStub).to.be.calledOnceWith(10, [
        { name: 'A', description: '' },
        { name: 'C', description: '' },
        { name: 'E', description: '' }
      ]);

      expect(updateStratumStub).to.be.calledOnceWith(10, [
        { name: 'B', description: '', survey_stratum_id: 1 },
        { name: 'D', description: '', survey_stratum_id: 2 },
        { name: 'F', description: '', survey_stratum_id: 3 }
      ]);

      expect(deleteStratumStub).to.be.calledOnceWith([4, 5])
    })
  });
});
