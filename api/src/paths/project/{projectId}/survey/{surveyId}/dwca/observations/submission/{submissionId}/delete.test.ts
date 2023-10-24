import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../../../../database/db';
import { OccurrenceService } from '../../../../../../../../../services/occurrence-service';
import { getMockDBConnection } from '../../../../../../../../../__mocks__/db';
import * as delete_submission from './delete';

chai.use(sinonChai);

describe('deleteOccurrenceSubmission', () => {
  const sampleReq = {
    keycloak_token: {},
    params: {
      projectId: 1,
      surveyId: 1,
      submissionId: 1
    }
  } as any;

  let actualResult: any = null;

  const sampleRes = {
    status: () => {
      return {
        json: (result: any) => {
          actualResult = result;
        }
      };
    }
  };

  afterEach(() => {
    sinon.restore();
  });

  it('should return false if no rows were deleted', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(OccurrenceService.prototype, 'deleteOccurrenceSubmission').resolves([]);

    const result = delete_submission.deleteOccurrenceSubmission();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.equal(false);
  });

  it('should return true if occurrence submission was deleted', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon
      .stub(OccurrenceService.prototype, 'deleteOccurrenceSubmission')
      .resolves([{ submission_spatial_component_id: 1 }]);

    const result = delete_submission.deleteOccurrenceSubmission();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.equal(true);
  });
});
