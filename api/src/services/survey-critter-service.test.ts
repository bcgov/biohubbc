import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SurveyCritterRepository } from '../repositories/survey-critter-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { CritterbaseService, getCritterbaseUserFromConnection } from './critterbase-service';
import { SurveyCritterService } from './survey-critter-service';

chai.use(sinonChai);

describe('SurveyService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getCrittersInSurvey', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyCritterService(dbConnection);

      const data = [
        {
          survey_id: 1,
          critter_id: 1,
          critterbase_critter_id: 'critter_id'
        }
      ];

      const repoStub = sinon.stub(SurveyCritterRepository.prototype, 'getCrittersInSurvey').resolves(data);

      const response = await service.getCrittersInSurvey(1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(data);
    });
  });

  describe('createCritterAndAddToSurvey', () => {
    it('should throw an error if duplicate alias in survey detected', async () => {
      const dbConnection = getMockDBConnection();
      const surveyCritterService = new SurveyCritterService(dbConnection);
      const critterbaseService = new CritterbaseService(getCritterbaseUserFromConnection(dbConnection));

      const aliasMap = new Map<string, any>([['alias', { critter_id: 'critter_id' }]]);

      const repoStub = sinon.stub(surveyCritterService.critterRepository, 'addCrittersToSurvey').resolves([1]);
      const surveyAliasMapStub = sinon.stub(surveyCritterService, 'getSurveyCritterAliasMap').resolves(aliasMap);
      const createCritterStub = sinon.stub(critterbaseService, 'createCritter').resolves('critter_id');

      try {
        await surveyCritterService.createCritterAndAddToSurvey(1, { animal_id: 'alias' } as any);

        expect.fail();
      } catch (err: any) {
        expect(err.message).to.equal('Critter alias: alias already exists in survey');
      }

      expect(surveyAliasMapStub).to.be.calledOnceWithExactly(1);
      expect(createCritterStub).to.not.be.calledOnce;
      expect(repoStub).to.not.be.calledOnce;
    });

    it('should return the survey critter id and critterbase critter id', async () => {
      const dbConnection = getMockDBConnection();
      const surveyCritterService = new SurveyCritterService(dbConnection);

      const aliasMap = new Map<string, any>([['bad', { critter_id: 'critter_id' }]]);

      const repoStub = sinon.stub(surveyCritterService.critterRepository, 'addCrittersToSurvey').resolves([1]);
      const surveyAliasMapStub = sinon.stub(surveyCritterService, 'getSurveyCritterAliasMap').resolves(aliasMap);
      const createCritterStub = sinon
        .stub(surveyCritterService.critterbaseService, 'createCritter')
        .resolves({ critter_id: 'critter_id' });

      const response = await surveyCritterService.createCritterAndAddToSurvey(1, { animal_id: 'alias' } as any);

      expect(surveyAliasMapStub).to.be.calledOnceWithExactly(1);
      expect(createCritterStub).to.be.calledOnceWithExactly({ animal_id: 'alias' });
      expect(repoStub).to.be.calledOnceWithExactly(1, ['critter_id']);

      expect(response.surveyCritterId).to.equal(1);
      expect(response.critterbaseCritterId).to.equal('critter_id');
    });
  });

  describe('removeCrittersFromSurvey', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyCritterService(dbConnection);

      const repoStub = sinon.stub(SurveyCritterRepository.prototype, 'removeCrittersFromSurvey').resolves();

      const response = await service.removeCrittersFromSurvey(1, [1]);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.be.undefined;
    });
  });

  describe('updateCritter', () => {
    it('updates critter, returns nothing', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyCritterService(dbConnection);

      const repoStub = sinon.stub(SurveyCritterRepository.prototype, 'updateCritter').resolves();

      const response = await service.updateCritter(1, 'asdf');

      expect(repoStub).to.be.calledOnce;
      expect(response).to.be.undefined;
    });
  });
});
