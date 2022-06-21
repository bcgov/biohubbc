import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import * as db from '../../../../../database/db';
import { HTTPError } from '../../../../../errors/custom-error';
import public_queries from '../../../../../queries/public';
import { getMockDBConnection } from '../../../../../__mocks__/db';
import * as list from './list';

chai.use(sinonChai);

describe('getPublicProjectAttachments', () => {
  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    body: {},
    params: {
      projectId: 1
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

  it('should throw a 400 error when no projectId is provided', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = list.getPublicProjectAttachments();
      await result(
        { ...sampleReq, params: { ...sampleReq.params, projectId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `projectId`');
    }
  });

  it('should throw a 400 error when no sql statement returned for getProjectAttachmentsSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(public_queries, 'getPublicProjectAttachmentsSQL').returns(null);

    try {
      const result = list.getPublicProjectAttachments();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should return a list of project attachments where the lastModified is the create_date', async () => {
    const mockQuery = sinon.stub();

    mockQuery
      .onFirstCall()
      .resolves({
        rows: [
          {
            id: 13,
            file_name: 'name1',
            create_date: '2020-01-01',
            update_date: '',
            file_size: 50,
            file_type: 'Image',
            is_secured: null
          }
        ]
      })
      .onSecondCall()
      .resolves({
        rows: [
          {
            id: 14,
            file_name: 'name2',
            create_date: '2020-01-01',
            update_date: '',
            file_size: 50,
            file_type: 'Report',
            is_secured: null
          }
        ]
      });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(public_queries, 'getPublicProjectAttachmentsSQL').returns(SQL`something`);

    const result = list.getPublicProjectAttachments();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.an('object');
    expect(actualResult).to.have.property('attachmentsList');

    expect(actualResult.attachmentsList).to.be.an('array');
    expect(actualResult.attachmentsList).to.have.length(2);

    expect(actualResult.attachmentsList[0].fileName).to.equal('name1');
    expect(actualResult.attachmentsList[0].fileType).to.equal('Image');
    expect(actualResult.attachmentsList[0].id).to.equal(13);
    expect(actualResult.attachmentsList[0].lastModified).to.match(new RegExp('2020-01-01T.*'));
    expect(actualResult.attachmentsList[0].size).to.equal(50);
    expect(actualResult.attachmentsList[0].securityToken).to.equal('false');

    expect(actualResult.attachmentsList[1].fileName).to.equal('name2');
    expect(actualResult.attachmentsList[1].fileType).to.equal('Report');
    expect(actualResult.attachmentsList[1].id).to.equal(14);
    expect(actualResult.attachmentsList[1].lastModified).to.match(new RegExp('2020-01-01T.*'));
    expect(actualResult.attachmentsList[1].size).to.equal(50);
    expect(actualResult.attachmentsList[1].securityToken).to.equal('false');
  });

  it('should return a list of project attachments where the lastModified is the update_date', async () => {
    const mockQuery = sinon.stub();

    mockQuery
      .onFirstCall()
      .resolves({
        rows: [
          {
            id: 13,
            file_name: 'name1',
            create_date: '2020-01-01',
            update_date: '2020-04-04',
            file_size: 50,
            file_type: 'Image',
            is_secured: null
          }
        ]
      })
      .onSecondCall()
      .resolves({
        rows: [
          {
            id: 14,
            file_name: 'name2',
            create_date: '2020-01-01',
            update_date: '2020-04-04',
            file_size: 50,
            file_type: 'Report',
            is_secured: null
          }
        ]
      });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(public_queries, 'getPublicProjectAttachmentsSQL').returns(SQL`something`);

    const result = list.getPublicProjectAttachments();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.an('object');
    expect(actualResult).to.have.property('attachmentsList');

    expect(actualResult.attachmentsList).to.be.an('array');
    expect(actualResult.attachmentsList).to.have.length(2);

    expect(actualResult.attachmentsList[0].fileName).to.equal('name1');
    expect(actualResult.attachmentsList[0].fileType).to.equal('Image');
    expect(actualResult.attachmentsList[0].id).to.equal(13);
    expect(actualResult.attachmentsList[0].lastModified).to.match(new RegExp('2020-04-04T.*'));
    expect(actualResult.attachmentsList[0].size).to.equal(50);
    expect(actualResult.attachmentsList[0].securityToken).to.equal('false');

    expect(actualResult.attachmentsList[1].fileName).to.equal('name2');
    expect(actualResult.attachmentsList[1].fileType).to.equal('Report');
    expect(actualResult.attachmentsList[1].id).to.equal(14);
    expect(actualResult.attachmentsList[1].lastModified).to.match(new RegExp('2020-04-04T.*'));
    expect(actualResult.attachmentsList[1].size).to.equal(50);
    expect(actualResult.attachmentsList[1].securityToken).to.equal('false');
  });

  it('should return null if the project has no attachments, on success', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: undefined });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(public_queries, 'getPublicProjectAttachmentsSQL').returns(SQL`something`);

    const result = list.getPublicProjectAttachments();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.null;
  });
});
