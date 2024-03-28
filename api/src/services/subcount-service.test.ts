import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
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

describe.only('SubCountService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('insertObservationSubCount', () => {
    it('shoud insert observation subcount', async () => {
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
    it('shoud insert subcount event', async () => {
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
});
