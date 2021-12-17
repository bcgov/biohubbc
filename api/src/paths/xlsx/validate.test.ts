import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import xlsx from 'xlsx';
import { CustomError } from '../../errors/CustomError';
import * as survey_occurrence_queries from '../../queries/survey/survey-occurrence-queries';
import * as media_utils from '../../utils/media/media-utils';
import { getMockDBConnection } from '../../__mocks__/db';
import { ArchiveFile, MediaFile } from '../../utils/media/media-file';
//import { ArchiveFile } from '../../utils/media/media-file';
import * as validate from './validate';

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

  it.only('should set parseError when no custom props set for the XLSX CSV file', async () => {
    const nextSpy = sinon.spy();

    //TODO:  create new workbook
    //assign new props
    //turn that into a buffer

    const newWorkbook = xlsx.utils.book_new();

    console.log('newWorkbook: ', newWorkbook);

    if (!newWorkbook.Custprops) {
      newWorkbook.Custprops = {};
    }
    newWorkbook.Custprops['sims_template_id'] = 1;
    newWorkbook.Custprops['sims_csm_id'] = 1;
    newWorkbook.Custprops['sims_species_id'] = 1234;

    console.log('newWorkbook.Custprops:', newWorkbook.Custprops);

    //xlsx.utils.book_append_sheet(newWorkbook, worksheet, DEFAULT_XLSX_SHEET);

    const ws_name = 'SheetJS';

    /* make worksheet */
    const ws_data = [
      ['S', 'h', 'e', 'e', 't', 'J', 'S'],
      [1, 2, 3, 4, 5]
    ];
    const ws = xlsx.utils.aoa_to_sheet(ws_data);

    /* Add the worksheet to the workbook */
    xlsx.utils.book_append_sheet(newWorkbook, ws, ws_name);

    const buffer = xlsx.write(newWorkbook, { type: 'buffer', bookType: 'csv' });

    //xlsx.writeFile(newWorkbook, 'workbook', { type: 'buffer' });

    // console.log('newWorkbook after converted to Buffer:', workbook);

    const mediaFile = new MediaFile('fileName', 'text/csv', buffer);

    sinon.stub(media_utils, 'parseUnknownMedia').returns(mediaFile);

    const requestHandler = validate.prepXLSX();
    //console.log('result is: ', result);
    const temp = await requestHandler(sampleReq, (null as unknown) as any, nextSpy as any);

    console.log('temp is : ', temp);

    expect(sampleReq.parseError).to.eql('Failed to parse submission, template identification properties are missing');
    expect(nextSpy).to.have.been.called;
  });
});

describe('getTemplateMethodologySpecies', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  it('should throw 400 error when failed to build getTemplateMethodologySpeciesSQL statement', async () => {
    sinon.stub(survey_occurrence_queries, 'getTemplateMethodologySpeciesSQL').returns(null);

    try {
      await validate.getTemplateMethodologySpecies(1, { ...dbConnectionObj, systemUserId: () => 20 });

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should return null when no rows', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [null]
    });

    sinon.stub(survey_occurrence_queries, 'getTemplateMethodologySpeciesSQL').returns(SQL`something`);

    const result = await validate.getTemplateMethodologySpecies(1, { ...dbConnectionObj, systemUserId: () => 20 });

    expect(result).to.equal(null);
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

    sinon.stub(survey_occurrence_queries, 'getTemplateMethodologySpeciesSQL').returns(SQL`something`);

    const result = await validate.getTemplateMethodologySpecies(1, {
      ...dbConnectionObj,
      query: mockQuery,
      systemUserId: () => 20
    });

    expect(result).to.eql({ id: 1 });
  });
});
