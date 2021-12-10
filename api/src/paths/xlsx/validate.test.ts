import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as validate from './validate';
import * as media_utils from '../../utils/media/media-utils';
import * as survey_occurrence_queries from '../../queries/survey/survey-occurrence-queries';
import { ArchiveFile } from '../../utils/media/media-file';
import { getMockDBConnection } from '../../__mocks__/db';
import SQL from 'sql-template-strings';
import { CustomError } from '../../errors/CustomError';

chai.use(sinonChai);

describe('prepXLSX', () => {
  const sampleReq = {
    keycloak_token: {},
    s3File: {
      fieldname: 'media',
      originalname: 'test.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      size: 340
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should set parseError when failed to parse s3File', async () => {
    const nextSpy = sinon.spy();

    sinon.stub(media_utils, 'parseUnknownMedia').returns(null);

    const result = validate.prepXLSX();
    await result(sampleReq, (null as unknown) as any, nextSpy as any);

    expect(sampleReq.parseError).to.eql('Failed to parse submission, file was empty');
    expect(nextSpy).to.have.been.called;
  });

  it('should set parseError when not a valid xlsx csv file', async () => {
    const nextSpy = sinon.spy();

    sinon.stub(media_utils, 'parseUnknownMedia').returns(('not a csv file' as unknown) as ArchiveFile);

    const result = validate.prepXLSX();
    await result(sampleReq, (null as unknown) as any, nextSpy as any);

    expect(sampleReq.parseError).to.eql('Failed to parse submission, not a valid XLSX CSV file');
    expect(nextSpy).to.have.been.called;
  });
});

describe('getTemplateMethodologySpecies', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  it('should throw 400 error when failed to build getTemplateMethodologySpeciesSQL statement', async () => {
    sinon.stub(survey_occurrence_queries, 'getTemplateMethodologySpeciesRecordSQL').returns(null);

    try {
      await validate.getTemplateMethodologySpeciesRecord(1234, 1, 1, { ...dbConnectionObj, systemUserId: () => 20 });

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal(
        'Failed to build SQL get template methodology species record sql statement'
      );
    }
  });

  // it('should return null when no rows', async () => {
  //   const mockQuery = sinon.stub();

  //   mockQuery.resolves({
  //     rows: [null]
  //   });

  //   sinon.stub(survey_occurrence_queries, 'getTemplateMethodologySpeciesRecordSQL').returns(SQL`something`);

  //   const result = await validate.getTemplateMethodologySpeciesRecord(123, 1, 1, {
  //     ...dbConnectionObj,
  //     systemUserId: () => 20
  //   });

  //   expect(result).to.equal(null);
  // });

  it('should return first row on success', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [
        {
          id: 1
        }
      ]
    });

    sinon.stub(survey_occurrence_queries, 'getTemplateMethodologySpeciesRecordSQL').returns(SQL`something`);

    const result = await validate.getTemplateMethodologySpeciesRecord(123, 1, 1, {
      ...dbConnectionObj,
      query: mockQuery,
      systemUserId: () => 20
    });

    expect(result).to.eql({ id: 1 });
  });
});
