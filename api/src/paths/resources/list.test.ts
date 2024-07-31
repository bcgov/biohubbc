import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { HTTPError } from '../../errors/http-error';
import * as fileUtils from '../../utils/file-utils';
import { getRequestHandlerMocks } from '../../__mocks__/db';
import { listResources } from './list';

chai.use(sinonChai);

describe('listResources', () => {
  beforeEach(() => {
    process.env.OBJECT_STORE_URL = 's3.host.example.com';
    process.env.OBJECT_STORE_BUCKET_NAME = 'test-bucket';
  });

  afterEach(() => {
    sinon.restore();
  });

  it('returns an empty array if no resources are found', async () => {
    const listFilesStub = sinon.stub(fileUtils, 'listFilesFromS3').resolves({
      $metadata: {},
      Contents: []
    });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = listResources();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(listFilesStub).to.have.been.calledWith('templates/Current');
    expect(mockRes.jsonValue).to.eql({ files: [] });
    expect(mockRes.statusValue).to.equal(200);
  });

  it('returns an array of resources', async () => {
    const mockMetadata: Record<string, Record<string, string>> = {
      ['key1']: {
        'template-name': 'name1',
        'template-type': 'type1',
        species: 'species1'
      },
      ['key2']: {
        'template-name': 'name2',
        'template-type': 'type2',
        species: 'species2'
      },
      ['key3']: {
        'template-name': 'name3',
        'template-type': 'type3',
        species: 'species3'
      }
    };

    sinon.stub(fileUtils, 'getObjectMeta').callsFake((key: string) => {
      return Promise.resolve({
        $metadata: {},
        Conents: [],
        Metadata: mockMetadata[key]
      });
    });

    const listFilesStub = sinon.stub(fileUtils, 'listFilesFromS3').resolves({
      $metadata: {},
      Contents: [
        {
          Key: 'key1',
          LastModified: new Date('2023-01-01'),
          Size: 5
        },
        {
          Key: 'key2',
          LastModified: new Date('2023-01-02'),
          Size: 10
        },
        {
          Key: 'key3',
          LastModified: new Date('2023-01-03'),
          Size: 15
        }
      ]
    });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = listResources();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(listFilesStub).to.have.been.calledWith('templates/Current');
    expect(mockRes.jsonValue).to.eql({
      files: [
        {
          fileName: 'key1',
          url: 'https://s3.host.example.com/test-bucket/key1',
          lastModified: new Date('2023-01-01').toISOString(),
          fileSize: 5,
          metadata: {
            templateName: 'name1',
            templateType: 'type1',
            species: 'species1'
          }
        },
        {
          fileName: 'key2',
          url: 'https://s3.host.example.com/test-bucket/key2',
          lastModified: new Date('2023-01-02').toISOString(),
          fileSize: 10,
          metadata: {
            templateName: 'name2',
            templateType: 'type2',
            species: 'species2'
          }
        },
        {
          fileName: 'key3',
          url: 'https://s3.host.example.com/test-bucket/key3',
          lastModified: new Date('2023-01-03').toISOString(),
          fileSize: 15,
          metadata: {
            templateName: 'name3',
            templateType: 'type3',
            species: 'species3'
          }
        }
      ]
    });
    expect(mockRes.statusValue).to.equal(200);
  });

  it('should filter out directories from the s3 list respones', async () => {
    sinon.stub(fileUtils, 'getObjectMeta').resolves({
      $metadata: {}
    });

    const listFilesStub = sinon.stub(fileUtils, 'listFilesFromS3').resolves({
      $metadata: {},
      Contents: [{ Key: 'templates/Current/' }]
    });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = listResources();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(listFilesStub).to.have.been.calledWith('templates/Current');
    expect(mockRes.jsonValue).to.eql({ files: [] });
    expect(mockRes.statusValue).to.equal(200);
  });

  it('catches error, and re-throws error', async () => {
    sinon.stub(fileUtils, 'listFilesFromS3').rejects(new Error('an error occurred'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    try {
      const requestHandler = listResources();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('an error occurred');
    }
  });
});
