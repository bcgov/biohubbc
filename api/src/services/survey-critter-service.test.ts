import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiGeneralError } from '../errors/api-error';
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

    it('should throw an error if duplicate non-trimmed alias in survey detected', async () => {
      const dbConnection = getMockDBConnection();
      const surveyCritterService = new SurveyCritterService(dbConnection);
      const critterbaseService = new CritterbaseService(getCritterbaseUserFromConnection(dbConnection));

      const aliasMap = new Map<string, any>([[' alias ', { critter_id: 'critter_id' }]]);

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

    it('should throw an error if duplicate case-insensitive alias in survey detected', async () => {
      const dbConnection = getMockDBConnection();
      const surveyCritterService = new SurveyCritterService(dbConnection);
      const critterbaseService = new CritterbaseService(getCritterbaseUserFromConnection(dbConnection));

      const aliasMap = new Map<string, any>([['ALIAS', { critter_id: 'critter_id' }]]);

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

      const surveyCritterAliasMapStub = sinon.stub(service, 'getSurveyCritterAliasMap');
      const getCritterStub = sinon.stub(service.critterbaseService, 'getCritter');
      const updateCritterRepoStub = sinon.stub(SurveyCritterRepository.prototype, 'updateCritter');
      const updateCritterCritterbaseStub = sinon.stub(service.critterbaseService, 'updateCritter');

      surveyCritterAliasMapStub.resolves(new Map<string, any>([['alias', { critter_id: 'A' }]]));
      getCritterStub.resolves({ critter_id: 'A', animal_id: 'alias', itis_tsn: 1 });
      updateCritterCritterbaseStub.resolves();
      updateCritterRepoStub.resolves();

      const response = await service.updateCritter(1, 2, { critter_id: 'A', animal_id: 'alias' } as any);

      expect(surveyCritterAliasMapStub).to.be.calledOnceWithExactly(1);
      expect(getCritterStub).to.be.calledOnceWithExactly('A');

      expect(updateCritterRepoStub).to.be.calledOnceWithExactly(2, 'A');
      expect(updateCritterCritterbaseStub).to.be.calledOnceWithExactly({
        critters: [
          {
            critter_id: 'A',
            animal_id: 'alias',
            wlh_id: undefined,
            sex_qualitative_option_id: undefined,
            itis_tsn: 1,
            critter_comment: undefined
          }
        ]
      });

      expect(response).to.be.undefined;
    });

    it('throws error if alias is duplicate in survey', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyCritterService(dbConnection);

      const surveyCritterAliasMapStub = sinon.stub(service, 'getSurveyCritterAliasMap');
      const getCritterStub = sinon.stub(service.critterbaseService, 'getCritter');
      const updateCritterRepoStub = sinon.stub(SurveyCritterRepository.prototype, 'updateCritter');
      const updateCritterCritterbaseStub = sinon.stub(service.critterbaseService, 'updateCritter');

      surveyCritterAliasMapStub.resolves(
        new Map<string, any>([
          ['old', { critter_id: 'A' }],
          ['new', { critter_id: 'B' }] // alias already exists in survey
        ])
      );
      getCritterStub.resolves({ critter_id: 'A', animal_id: 'old' });
      updateCritterCritterbaseStub.resolves();
      updateCritterRepoStub.resolves();

      try {
        await service.updateCritter(1, 2, { critter_id: 'A', animal_id: 'new' } as any);
        expect.fail();
      } catch (err: any) {
        expect(err).to.be.instanceOf(ApiGeneralError);

        expect(surveyCritterAliasMapStub).to.be.calledOnceWithExactly(1);
        expect(getCritterStub).to.be.calledOnceWithExactly('A');

        expect(updateCritterRepoStub).to.not.be.calledOnce;
        expect(updateCritterCritterbaseStub).to.not.be.calledOnce;
      }
    });
  });
});
