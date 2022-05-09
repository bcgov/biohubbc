import { expect } from 'chai';
import { describe } from 'mocha';
import { SYSTEM_IDENTITY_SOURCE } from '../constants/database';
import { convertUserIdentitySource, getUserIdentifier, getUserIdentitySource } from './keycloak-utils';

describe('getUserIdentifier', () => {
  it('returns null response when null keycloakToken provided', () => {
    const response = getUserIdentifier((null as unknown) as object);

    expect(response).to.be.null;
  });

  it('returns null response when valid keycloakToken provided with no preferred_username', () => {
    const response = getUserIdentifier({});

    expect(response).to.be.null;
  });

  it('returns null response when valid keycloakToken provided with null preferred_username', () => {
    const response = getUserIdentifier({ preferred_username: null });

    expect(response).to.be.null;
  });

  it('returns null response when valid keycloakToken provided with no username', () => {
    const response = getUserIdentifier({ preferred_username: '@source' });

    expect(response).to.be.null;
  });

  it('returns non null response when valid keycloakToken provided', () => {
    const response = getUserIdentifier({ preferred_username: 'username@source' });

    expect(response).to.not.be.null;
  });
});

describe('getUserIdentitySource', () => {
  it('returns null response when null keycloakToken provided', () => {
    const response = getUserIdentitySource((null as unknown) as object);

    expect(response).to.equal(null);
  });

  it('returns null response when valid keycloakToken provided with no preferred_username', () => {
    const response = getUserIdentitySource({});

    expect(response).to.equal(null);
  });

  it('returns null response when valid keycloakToken provided with null preferred_username', () => {
    const response = getUserIdentitySource({ preferred_username: null });

    expect(response).to.equal(null);
  });

  it('returns null response when valid keycloakToken provided with no source', () => {
    const response = getUserIdentitySource({ preferred_username: 'username' });

    expect(response).to.equal(null);
  });

  it('returns non null response when valid keycloakToken provided with lowercase idir source', () => {
    const response = getUserIdentitySource({ preferred_username: 'username@idir' });

    expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.IDIR);
  });

  it('returns non null response when valid keycloakToken provided with lowercase bceid source', () => {
    const response = getUserIdentitySource({ preferred_username: 'username@bceid' });

    expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.BCEID);
  });

  it('returns non null response when valid keycloakToken provided with lowercase bceid basic and business source', () => {
    const response = getUserIdentitySource({ preferred_username: 'username@bceid-basic-and-business' });

    expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.BCEID);
  });

  it('returns non null response when valid keycloakToken provided with lowercase database source', () => {
    const response = getUserIdentitySource({ preferred_username: 'username@database' });

    expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.DATABASE);
  });

  it('returns non null response when valid keycloakToken provided with uppercase idir source', () => {
    const response = getUserIdentitySource({ preferred_username: 'username@IDIR' });

    expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.IDIR);
  });

  it('returns non null response when valid keycloakToken provided with uppercase bceid source', () => {
    const response = getUserIdentitySource({ preferred_username: 'username@BCEID' });

    expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.BCEID);
  });

  it('returns non null response when valid keycloakToken provided with uppercase bceid basic and business source', () => {
    const response = getUserIdentitySource({ preferred_username: 'username@BCEID-BASIC-AND-BUSINESS' });

    expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.BCEID);
  });

  it('returns non null response when valid keycloakToken provided with uppercase database source', () => {
    const response = getUserIdentitySource({ preferred_username: 'username@DATABASE' });

    expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.DATABASE);
  });

  describe('convertUserIdentitySource', () => {
    it('returns null response when null identity source provided', () => {
      const response = convertUserIdentitySource((null as unknown) as string);

      expect(response).to.equal(null);
    });

    it('returns null response when empty identity source provided', () => {
      const response = convertUserIdentitySource('');

      expect(response).to.equal(null);
    });

    it('returns non null response when lowercase idir source provided', () => {
      const response = convertUserIdentitySource('idir');

      expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.IDIR);
    });

    it('returns non null response when lowercase bceid source provided', () => {
      const response = convertUserIdentitySource('bceid');

      expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.BCEID);
    });

    it('returns non null response when lowercase bceid basic and business source provided', () => {
      const response = convertUserIdentitySource('bceid-basic-and-business');

      expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.BCEID);
    });

    it('returns non null response when lowercase database source provided', () => {
      const response = convertUserIdentitySource('database');

      expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.DATABASE);
    });

    it('returns non null response when uppercase idir source provided', () => {
      const response = convertUserIdentitySource('IDIR');

      expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.IDIR);
    });

    it('returns non null response when uppercase bceid source provided', () => {
      const response = convertUserIdentitySource('BCEID');

      expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.BCEID);
    });

    it('returns non null response when uppercase bceid basic and business source provided', () => {
      const response = convertUserIdentitySource('BCEID-BASIC-AND-BUSINESS');

      expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.BCEID);
    });

    it('returns non null response when uppercase database source provided', () => {
      const response = convertUserIdentitySource('DATABASE');

      expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.DATABASE);
    });
  });
});
