import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiError } from '../errors/api-error';
import { getMockDBConnection } from '../__mocks__/db';
import { DraftService } from './draft-service';

chai.use(sinonChai);

describe('DraftService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('deleteDraft', () => {
    it('succeeds with valid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new DraftService(dbConnection);

      const data = {
        draftId: 1
      };

      const repoStub = sinon.stub(DraftService.prototype, 'deleteDraft').resolves();

      const response = await service.deleteDraft(data.draftId);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(undefined);
    });

    it('fails with invalid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new DraftService(dbConnection);

      const data = {
        draftId: 1
      };

      const expectedError = new Error('service function failed');

      const repoStub = sinon.stub(DraftService.prototype, 'deleteDraft').rejects(expectedError);
      try {
       await service.deleteDraft(data.draftId);
        expect.fail();
      } catch (actualError) {
        console.log('the error is: ', actualError);
        expect(repoStub).to.be.calledOnce;
        expect((actualError as ApiError).message).to.equal(expectedError.message);
      }
    });
  });
});
