import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { PostSurveyLocationData } from '../models/survey-update';
import { SurveyLocationRecord, SurveyLocationRepository } from '../repositories/survey-location-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { SurveyLocationService } from './survey-location-service';

chai.use(sinonChai);

describe('SurveyLocationService', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dataObj = {
    survey_location_id: 1,
    name: 'Updated Test Location',
    description: 'Updated Test Description',
    geojson: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [1, 1]
        },
        properties: {}
      }
    ],
    revision_count: 2
  };

  const data = new PostSurveyLocationData(dataObj);

  describe('insertSurveyLocation', () => {
    it('inserts survey location and returns void', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyLocationService(dbConnection);

      const repoStub = sinon.stub(SurveyLocationRepository.prototype, 'insertSurveyLocation').resolves();

      const response = await service.insertSurveyLocation(1, data);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.be.undefined;
    });
  });

  describe('updateSurveyLocation', () => {
    it('updates survey location and returns void', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyLocationService(dbConnection);

      const repoStub = sinon.stub(SurveyLocationRepository.prototype, 'updateSurveyLocation').resolves();

      const response = await service.updateSurveyLocation(data);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.be.undefined;
    });
  });

  describe('getSurveyLocationsData', () => {
    it('returns list of survey locations', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyLocationService(dbConnection);

      const repoStub = sinon
        .stub(SurveyLocationRepository.prototype, 'getSurveyLocationsData')
        .resolves([{} as SurveyLocationRecord]);

      const response = await service.getSurveyLocationsData(1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql([{}]);
    });
  });

  describe('deleteSurveyLocation', () => {
    it('deletes survey location and returns record', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyLocationService(dbConnection);

      const repoStub = sinon
        .stub(SurveyLocationRepository.prototype, 'deleteSurveyLocation')
        .resolves({} as SurveyLocationRecord);

      const response = await service.deleteSurveyLocation(1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql({});
    });
  });
});
