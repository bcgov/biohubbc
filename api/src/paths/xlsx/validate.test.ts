import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as validate from './validate';
import * as media_utils from '../../utils/media/media-utils';
import survey_queries from '../../queries/survey';
import { ArchiveFile } from '../../utils/media/media-file';
import { getMockDBConnection } from '../../__mocks__/db';
import SQL from 'sql-template-strings';
import { HTTPError } from '../../errors/custom-error';

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

  it('should set parseError when no custom props set for the XLSX CSV file', async () => {
    const nextSpy = sinon.spy();

    const newWorkbook = xlsx.utils.book_new();

    if (!newWorkbook.Custprops) {
      newWorkbook.Custprops = {};
    }

    const ws_name = 'SheetJS';

    /* make worksheet */
    const ws_data = [
      ['S', 'h', 'e', 'e', 't', 'J', 'S'],
      [1, 2, 3, 4, 5]
    ];
    const ws = xlsx.utils.aoa_to_sheet(ws_data);

    /* Add the worksheet to the workbook */
    xlsx.utils.book_append_sheet(newWorkbook, ws, ws_name);

    const buffer = xlsx.write(newWorkbook, { type: 'buffer' });

    const mediaFile = new MediaFile('fileName', 'text/csv', buffer);

    sinon.stub(media_utils, 'parseUnknownMedia').returns(mediaFile);

    const requestHandler = validate.prepXLSX();
    await requestHandler(sampleReq, (null as unknown) as any, nextSpy as any);

    expect(sampleReq.parseError).to.eql('Failed to parse submission, template identification properties are missing');
    expect(nextSpy).to.have.been.called;
  });

  it('should call next when parameters are valid', async () => {
    const nextSpy = sinon.spy();

    const newWorkbook = xlsx.utils.book_new();

    if (!newWorkbook.Custprops) {
      newWorkbook.Custprops = {};
    }
    newWorkbook.Custprops['sims_template_id'] = 1;
    newWorkbook.Custprops['sims_csm_id'] = 1;
    newWorkbook.Custprops['sims_species_id'] = 1234;

    const ws_name = 'SheetJS';

    /* make worksheet */
    const ws_data = [
      ['S', 'h', 'e', 'e', 't', 'J', 'S'],
      [1, 2, 3, 4, 5]
    ];
    const ws = xlsx.utils.aoa_to_sheet(ws_data);

    /* Add the worksheet to the workbook */
    xlsx.utils.book_append_sheet(newWorkbook, ws, ws_name);

    const buffer = xlsx.write(newWorkbook, { type: 'buffer' });

    const mediaFile = new MediaFile('fileName', 'text/csv', buffer);

    sinon.stub(media_utils, 'parseUnknownMedia').returns(mediaFile);

    //const xlsxCsv = (null as unknown) as XLSXCSV;

    const requestHandler = validate.prepXLSX();
    await requestHandler(sampleReq, (null as unknown) as any, nextSpy as any);

    expect(nextSpy).to.have.been.called;
  });
});

describe('getTemplateMethodologySpeciesRecord', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  it('should throw 400 error when failed to build getTemplateMethodologySpeciesRecordSQL statement', async () => {
    sinon.stub(survey_queries, 'getTemplateMethodologySpeciesRecordSQL').returns(null);

    try {
      await validate.getTemplateMethodologySpeciesRecord(1234, 1, 1, { ...dbConnectionObj, systemUserId: () => 20 });

      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal(
        'Failed to build SQL get template methodology species record sql statement'
      );
    }
  });

  it('should return null when no rows', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [null]
    });

    sinon.stub(survey_queries, 'getTemplateMethodologySpeciesRecordSQL').returns(SQL`something`);

    try {
      await validate.getTemplateMethodologySpeciesRecord(1234, 1, 1, {
        ...dbConnectionObj,
        systemUserId: () => 20
      });
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to query template methodology species table');
    }
  });

  it('should return first row on success', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [
        {
          id: 1
        }
      ]
    });

    sinon.stub(survey_queries, 'getTemplateMethodologySpeciesRecordSQL').returns(SQL`something`);

    const result = await validate.getTemplateMethodologySpeciesRecord(1234, 1, 1, {
      ...dbConnectionObj,
      query: mockQuery,
      systemUserId: () => 20
    });

    expect(result).to.eql({ id: 1 });
  });
});
