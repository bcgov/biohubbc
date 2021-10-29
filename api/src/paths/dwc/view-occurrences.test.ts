import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as view_occurrences from './view-occurrences';
import * as db from '../../database/db';
import * as occurrence_view_queries from '../../queries/occurrence/occurrence-view-queries';
import SQL from 'sql-template-strings';
import { getMockDBConnection } from '../../__mocks__/db';
import { CustomError } from '../../errors/CustomError';

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

  it('should throw a 400 error when no occurrence submission id in request body', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = view_occurrences.getOccurrencesForView();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal(
        'Missing required request body param `occurrence_submission_id`'
      );
    }
  });

  it('should throw an error when failed to build SQL get occurrences for view statement', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(occurrence_view_queries, 'getOccurrencesForViewSQL').returns(null);

    try {
      const result = view_occurrences.getOccurrencesForView();

      await result(
        { ...sampleReq, body: { occurrence_submission_id: 1 } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Failed to build SQL get occurrences for view statement');
    }
  });

  it('should throw an error when failed to get occurrences view data', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: null
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(occurrence_view_queries, 'getOccurrencesForViewSQL').returns(SQL`something`);

    try {
      const result = view_occurrences.getOccurrencesForView();

      await result(
        { ...sampleReq, body: { occurrence_submission_id: 1 } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Failed to get occurrences view data');
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

    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [data]
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(occurrence_view_queries, 'getOccurrencesForViewSQL').returns(SQL`something`);

    const result = view_occurrences.getOccurrencesForView();

    await result({ ...sampleReq, body: { occurrence_submission_id: 1 } }, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.eql([
      {
        geometry: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [50.7, 60.9]
          },
          properties: {}
        },
        taxonId: data.taxonid,
        occurrenceId: data.occurrence_id,
        individualCount: Number(data.individualcount),
        lifeStage: data.lifestage,
        sex: data.sex,
        organismQuantity: Number(data.organismquantity),
        organismQuantityType: data.organismquantitytype,
        vernacularName: data.vernacularname,
        eventDate: data.eventdate
      }
    ]);
  });
});
