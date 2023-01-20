import chai, { expect } from 'chai';
import { GeoJsonProperties } from 'geojson';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import { OccurrenceService } from '../../services/occurrence-service';
import { getMockDBConnection } from '../../__mocks__/db';
import * as metadata from './metadata';

chai.use(sinonChai);

describe('getSpatialMetadataBySubmissionSpatialComponentIds', () => {
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

  it('should throw an error when failed to get metadata', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });
    const expectedError = new Error('cannot process request');
    sinon
      .stub(OccurrenceService.prototype, 'findSpatialMetadataBySubmissionSpatialComponentIds')
      .rejects(expectedError);

    try {
      const result = metadata.getSpatialMetadataBySubmissionSpatialComponentIds();

      await result(
        { ...sampleReq, query: { submissionSpatialComponentIds: [1] } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });

  it('should return the occurrences view data on success', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon
      .stub(OccurrenceService.prototype, 'findSpatialMetadataBySubmissionSpatialComponentIds')
      .resolves([({ id: 1 } as unknown) as GeoJsonProperties]);

    const result = metadata.getSpatialMetadataBySubmissionSpatialComponentIds();

    await result(
      { ...sampleReq, query: { submissionSpatialComponentIds: [1] } },
      sampleRes as any,
      (null as unknown) as any
    );

    expect(actualResult).to.be.eql([{ id: 1 }]);
  });
});
