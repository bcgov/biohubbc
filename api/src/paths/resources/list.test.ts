import chai, { expect } from 'chai';
import { describe } from 'mocha';
import OpenAPIResponseValidator, { OpenAPIResponseValidatorArgs } from 'openapi-response-validator';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { HTTPError } from '../../errors/http-error';
import * as fileUtils from '../../utils/file-utils';
import { getRequestHandlerMocks } from '../../__mocks__/db';
import { GET, listResources } from './list';

chai.use(sinonChai);

describe('listResources', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('returns an empty array if no resources are found', async () => {
    const listFilesStub = sinon.stub(fileUtils, 'listFilesFromS3').resolves({
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
    const mockMetadata = {
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

    sinon.stub(fileUtils, 'getS3PublicHostUrl').returns('s3.host.example.com');
    sinon.stub(fileUtils, 'getObjectMeta').callsFake((key: string) => {
      return Promise.resolve({
        Metadata: mockMetadata[key]
      });
    });

    const listFilesStub = sinon.stub(fileUtils, 'listFilesFromS3').resolves({
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
          url: 's3.host.example.com/key1',
          lastModified: new Date('2023-01-01').toString(),
          fileSize: 5,
          metadata: {
            templateName: 'name1',
            templateType: 'type1',
            species: 'species1'
          }
        },
        {
          fileName: 'key2',
          url: 's3.host.example.com/key2',
          lastModified: new Date('2023-01-02').toString(),
          fileSize: 10,
          metadata: {
            templateName: 'name2',
            templateType: 'type2',
            species: 'species2'
          }
        },
        {
          fileName: 'key3',
          url: 's3.host.example.com/key3',
          lastModified: new Date('2023-01-03').toString(),
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
    sinon.stub(fileUtils, 'getS3PublicHostUrl').returns('s3.host.example.com');
    sinon.stub(fileUtils, 'getObjectMeta').resolves({});

    const listFilesStub = sinon.stub(fileUtils, 'listFilesFromS3').resolves({
      Contents: [
        {
          Key: 'templates/Current/'
        }
      ]
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

  describe('openApiSchema', () => {
    describe('response validation', () => {
      const responseValidator = new OpenAPIResponseValidator((GET.apiDoc as unknown) as OpenAPIResponseValidatorArgs);

      describe('should succeed when', () => {
        it('returns an empty response', async () => {
          const apiResponse = { files: [] };
          const response = responseValidator.validateResponse(200, apiResponse);

          expect(response).to.equal(undefined);
        });

        it('optional values are not included', async () => {
          const apiResponse = {
            files: [
              {
                url: 'string1',
                fileName: 'string1',
                lastModified: 'string1',
                fileSize: 0,
                metadata: {}
              }
            ]
          };
          const response = responseValidator.validateResponse(200, apiResponse);

          expect(response).to.equal(undefined);
        });

        it('optional values are valid', async () => {
          const apiResponse = {
            files: [
              {
                url: 'string1',
                fileName: 'string1',
                lastModified: 'string1',
                fileSize: 0,
                metadata: {
                  templateName: 'string1',
                  templateType: 'string1',
                  species: 'string1'
                }
              }
            ]
          };
          const response = responseValidator.validateResponse(200, apiResponse);

          expect(response).to.equal(undefined);
        });
      });

      describe('should fail when', () => {
        it('returns a null response', async () => {
          const apiResponse = null;
          const response = responseValidator.validateResponse(200, apiResponse);

          expect(response.message).to.equal('The response was not valid.');
          expect(response.errors[0].message).to.equal('must be object');
        });

        it('file has no fileName', async () => {
          const apiResponse = {
            files: [
              {
                url: 'string1',
                lastModified: 'string1',
                fileSize: 0,
                metadata: {}
              }
            ]
          };

          const response = responseValidator.validateResponse(200, apiResponse);
          expect(response.message).to.equal('The response was not valid.');
          expect(response.errors.length).to.equal(1);
          expect(response.errors[0].message).to.equal("must have required property 'fileName'");
          expect(response.errors[0].path).to.equal('files/0');
        });

        it('file has no url', async () => {
          const apiResponse = {
            files: [
              {
                fileName: 'string1',
                lastModified: 'string1',
                fileSize: 0,
                metadata: {}
              }
            ]
          };

          const response = responseValidator.validateResponse(200, apiResponse);
          expect(response.message).to.equal('The response was not valid.');
          expect(response.errors.length).to.equal(1);
          expect(response.errors[0].message).to.equal("must have required property 'url'");
          expect(response.errors[0].path).to.equal('files/0');
        });

        it('file has no lastModified', async () => {
          const apiResponse = {
            files: [
              {
                url: 'string1',
                fileName: 'string1',
                fileSize: 0,
                metadata: {}
              }
            ]
          };

          const response = responseValidator.validateResponse(200, apiResponse);
          expect(response.message).to.equal('The response was not valid.');
          expect(response.errors.length).to.equal(1);
          expect(response.errors[0].message).to.equal("must have required property 'lastModified'");
          expect(response.errors[0].path).to.equal('files/0');
        });

        it('file has no fileSize', async () => {
          const apiResponse = {
            files: [
              {
                url: 'string1',
                fileName: 'string1',
                lastModified: 'string1',
                metadata: {}
              }
            ]
          };

          const response = responseValidator.validateResponse(200, apiResponse);
          expect(response.message).to.equal('The response was not valid.');
          expect(response.errors.length).to.equal(1);
          expect(response.errors[0].message).to.equal("must have required property 'fileSize'");
          expect(response.errors[0].path).to.equal('files/0');
        });

        it('fileSize is not a number', async () => {
          const apiResponse = {
            files: [
              {
                url: 'string1',
                fileName: 'string1',
                lastModified: 'string1',
                fileSize: '100 kB',
                metadata: {}
              }
            ]
          };

          const response = responseValidator.validateResponse(200, apiResponse);
          expect(response.message).to.equal('The response was not valid.');
          expect(response.errors.length).to.equal(1);
          expect(response.errors[0].message).to.equal('must be number');
          expect(response.errors[0].path).to.equal('files/0/fileSize');
        });

        it('file has no metadata', async () => {
          const apiResponse = {
            files: [
              {
                url: 'string1',
                lastModified: 'string1',
                fileName: 'string1',
                fileSize: 0
              }
            ]
          };

          const response = responseValidator.validateResponse(200, apiResponse);
          expect(response.message).to.equal('The response was not valid.');
          expect(response.errors.length).to.equal(1);
          expect(response.errors[0].message).to.equal("must have required property 'metadata'");
          expect(response.errors[0].path).to.equal('files/0');
        });
      });
    });
  });
});
