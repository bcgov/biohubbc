import { expect } from 'chai';
import { getRequestHandlerMocks } from '../__mocks__/db';
import { getFileFromRequest } from './request';

describe('getFileFromRequest', () => {
  it('should throw error if unable to retrieve file - missing file', () => {
    try {
      const { mockReq } = getRequestHandlerMocks();

      getFileFromRequest(mockReq);
      expect.fail();
    } catch (err: any) {
      expect(err.message).to.be.eql('Request missing file. Unable to retrieve file at index 0.');
    }
  });

  it('should throw error if unable to retrieve file - wrong index', () => {
    try {
      const { mockReq } = getRequestHandlerMocks();
      mockReq.files = ['file' as unknown as Express.Multer.File];

      getFileFromRequest(mockReq, 1);
      expect.fail();
    } catch (err: any) {
      expect(err.message).to.be.eql('Request missing file. Unable to retrieve file at index 1.');
    }
  });

  it('should return file 0 as default', () => {
    const { mockReq } = getRequestHandlerMocks();
    mockReq.files = ['file', 'file2'] as unknown as Express.Multer.File[];
    expect(getFileFromRequest(mockReq)).to.be.eql('file');
  });

  it('should return file specified by index', () => {
    const { mockReq } = getRequestHandlerMocks();
    mockReq.files = ['file', 'file2'] as unknown as Express.Multer.File[];
    expect(getFileFromRequest(mockReq, 1)).to.be.eql('file2');
  });
});
