import { expect } from 'chai';
import { SystemUser } from '../repositories/user-repository';
import { getRequestHandlerMocks } from '../__mocks__/db';
import { KeycloakUserInformation } from './keycloak-utils';
import { getFileFromRequest, getKeycloakTokenFromRequest, getSystemUserFromRequest } from './request';

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

describe('getKeycloakTokenFromRequest', () => {
  it('should throw error when keycloak_token is undefined', () => {
    try {
      const { mockReq } = getRequestHandlerMocks();
      getKeycloakTokenFromRequest(mockReq);
      expect.fail();
    } catch (err: any) {
      expect(err.message).to.be.eql('Request missing keycloak token. Must be authenticated.');
    }
  });

  it('should return keycloak_token', () => {
    const { mockReq } = getRequestHandlerMocks();
    const mockToken = { token: true } as unknown as KeycloakUserInformation;

    mockReq.keycloak_token = mockToken;

    expect(getKeycloakTokenFromRequest(mockReq)).to.be.eql(mockToken);
  });
});

describe('getSystemUserFromRequest', () => {
  it('should throw error when system_user is undefined', () => {
    try {
      const { mockReq } = getRequestHandlerMocks();
      getSystemUserFromRequest(mockReq);
      expect.fail();
    } catch (err: any) {
      expect(err.message).to.be.eql('Request missing system user. Must be authorized.');
    }
  });

  it('should return system_user', () => {
    const { mockReq } = getRequestHandlerMocks();
    const mockUser = { user: true } as unknown as SystemUser;

    mockReq.system_user = mockUser;

    expect(getSystemUserFromRequest(mockReq)).to.be.eql(mockUser);
  });
});
