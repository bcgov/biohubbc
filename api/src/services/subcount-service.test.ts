import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ObservationSubCountEnvironmentRepository } from '../repositories/observation-subcount-environment-repository';
import { ObservationSubCountMeasurementRepository } from '../repositories/observation-subcount-measurement-repository';
import {
  InsertObservationSubCount,
  InsertSubCountEvent,
  ObservationSubCountRecord,
  SubCountEventRecord,
  SubCountRepository
} from '../repositories/subcount-repository';
import { getMockDBConnection } from '../__mocks__/db';
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

      const insertObservationSubCountStub = sinon
        .stub(SubCountRepository.prototype, 'insertObservationSubCount')
        .resolves({ observation_subcount_id: 1 } as ObservationSubCountRecord);

      const response = await subCountService.insertObservationSubCount({
        survey_observation_id: 1
      } as InsertObservationSubCount);

      expect(insertObservationSubCountStub).to.be.calledOnceWith({ survey_observation_id: 1 });
      expect(response).to.eql({ observation_subcount_id: 1 });
    });
  });

  describe('insertSubCountEvent', () => {
    it('should insert subcount event', async () => {
      const mockDbConnection = getMockDBConnection();
      const subCountService = new SubCountService(mockDbConnection);

      const insertSubCountEventStub = sinon
        .stub(SubCountRepository.prototype, 'insertSubCountEvent')
        .resolves({ observation_subcount_id: 1 } as SubCountEventRecord);

      const response = await subCountService.insertSubCountEvent({ observation_subcount_id: 1 } as InsertSubCountEvent);

      expect(insertSubCountEventStub).to.be.calledOnceWith({ observation_subcount_id: 1 });
      expect(response).to.eql({ observation_subcount_id: 1 });
    });
  });

  describe('deleteObservationSubCountRecords', () => {
    it('should delete observation_subcount records and related child records', async () => {
      const mockDbConnection = getMockDBConnection();
      const subCountService = new SubCountService(mockDbConnection);

      const mockSurveyId = 1;
      const mockSurveyObservationIds = [1, 2, 3, 4];

      const deleteSubCountCritterRecordsForObservationIdStub = sinon
        .stub(SubCountRepository.prototype, 'deleteSubCountCritterRecordsForObservationId')
        .resolves();

      const deleteObservationMeasurementsStub = sinon
        .stub(ObservationSubCountMeasurementRepository.prototype, 'deleteObservationMeasurements')
        .resolves();

      const deleteObservationEnvironmentsStub = sinon
        .stub(ObservationSubCountEnvironmentRepository.prototype, 'deleteObservationEnvironments')
        .resolves();

      const deleteObservationSubCountRecordsStub = sinon
        .stub(SubCountRepository.prototype, 'deleteObservationSubCountRecords')
        .resolves();

      await subCountService.deleteObservationSubCountRecords(mockSurveyId, mockSurveyObservationIds);

      expect(deleteSubCountCritterRecordsForObservationIdStub).to.be.calledOnceWith(
        mockSurveyId,
        mockSurveyObservationIds
      );
      expect(deleteObservationMeasurementsStub).to.be.calledOnceWith(mockSurveyId, mockSurveyObservationIds);
      expect(deleteObservationEnvironmentsStub).to.be.calledOnceWith(mockSurveyId, mockSurveyObservationIds);
      expect(deleteObservationSubCountRecordsStub).to.be.calledOnceWith(mockSurveyId, mockSurveyObservationIds);
    });
  });
});
