import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { ObservationSubcountModel } from '../database-models/observation_subcount';
import { ObservationSubCountMeasurementRepository } from '../repositories/observation-subcount-measurement-repository';
import { InsertObservationSubCount, SubCountRepository } from '../repositories/subcount-repository';
import { SubCountService } from './subcount-service';

chai.use(sinonChai);

describe('SubCountService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('insertObservationSubCount', () => {
    it('should insert observation subcount', async () => {
      const mockDbConnection = getMockDBConnection();
      const subCountService = new SubCountService(mockDbConnection);

      const mockObservationSubcountModel: ObservationSubcountModel = {
        observation_subcount_id: 1,
        survey_observation_id: 2,
        subcount: 3,
        comment: 'comment',
        critterbase_critter_id: null,
        create_user: 1,
        create_date: '2021-01-01',
        update_user: null,
        update_date: null,
        revision_count: 0
      };

      const mockInsertObservationSubCount: InsertObservationSubCount = {
        survey_observation_id: 2,
        subcount: 3,
        comment: 'comment',
        critterbase_critter_id: null
      };

      const insertObservationSubCountStub = sinon
        .stub(SubCountRepository.prototype, 'insertObservationSubCount')
        .resolves(mockObservationSubcountModel);

      const response = await subCountService.insertObservationSubCount(mockInsertObservationSubCount);

      expect(insertObservationSubCountStub).to.be.calledOnceWith(mockInsertObservationSubCount);
      expect(response).to.eql(mockObservationSubcountModel);
    });
  });

  describe('deleteObservationSubCountRecordsByObservationId', () => {
    it('should delete observation_subcount records and related child records', async () => {
      const mockDbConnection = getMockDBConnection();
      const subCountService = new SubCountService(mockDbConnection);

      const mockSurveyId = 1;
      const mockSurveyObservationIds = [1, 2, 3, 4];

      const deleteObservationMeasurementsStub = sinon
        .stub(ObservationSubCountMeasurementRepository.prototype, 'deleteObservationMeasurements')
        .resolves();
      const deleteObservationSubCountRecordsStub = sinon
        .stub(SubCountRepository.prototype, 'deleteObservationSubCountRecordsByObservationId')
        .resolves();

      await subCountService.deleteObservationSubCountRecordsByObservationId(mockSurveyId, mockSurveyObservationIds);

      expect(deleteObservationMeasurementsStub).to.be.calledOnceWith(mockSurveyId, mockSurveyObservationIds);
      expect(deleteObservationSubCountRecordsStub).to.be.calledOnceWith(mockSurveyId, mockSurveyObservationIds);
    });
  });
});
