import { expect } from 'chai';
import { SYSTEM_ROLE } from '../constants/roles';
import { SystemUserWithRoles } from '../models/system-user-view';
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
    const mockUser: SystemUserWithRoles = {
      system_user_id: 20,
      user_guid: '123-456-789',
      user_identifier: 'test-identifier',
      identity_source: 'IDIR',
      display_name: 'test-user',
      given_name: 'test-given',
      family_name: 'test-family',
      email: 'test-email',
      agency: 'test-agency',
      record_end_date: null,
      role_ids: [1],
      role_names: [SYSTEM_ROLE.SYSTEM_ADMIN]
    };

    mockReq.system_user = mockUser;

    expect(getSystemUserFromRequest(mockReq)).to.be.eql(mockUser);
  });
});
