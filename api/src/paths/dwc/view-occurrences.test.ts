import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import { ErrorService } from '../../services/error-service';
import { OccurrenceService } from '../../services/occurrence-service';
import { getMockDBConnection } from '../../__mocks__/db';
import * as view_occurrences from './view-occurrences';

chai.use(sinonChai);

describe('getOccurrencesForView', () => {
  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    body: {
      occurrence_submission_id: null
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

  it('should throw an error when failed to get occurrences view data', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });
    const expectedError = new Error('cannot process request');
    sinon.stub(OccurrenceService.prototype, 'getOccurrences').rejects(expectedError);

    sinon.stub(ErrorService.prototype, 'insertSubmissionStatus').resolves();

    try {
      const result = view_occurrences.getOccurrencesForView();

      await result(
        { ...sampleReq, body: { occurrence_submission_id: 1 } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });

  it('should return the occurrences view data on success', async () => {
    const data = {
      geometry: '{"type":"Point","coordinates":[50.7,60.9]}',
      taxonid: 'M-LAL',
      occurrence_id: 1,
      lifestage: 'Adult',
      sex: 'Female',
      vernacularname: 'V-name',
      individualcount: 2,
      organismquantity: 2,
      organismquantitytype: 'Q-type',
      eventdate: '2020/04/04'
    };
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(OccurrenceService.prototype, 'getOccurrences').resolves([data]);

    const result = view_occurrences.getOccurrencesForView();

    await result({ ...sampleReq, body: { occurrence_submission_id: 1 } }, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.eql([data]);
  });
});
