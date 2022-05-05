import { expect } from 'chai';
import { describe } from 'mocha';
import { SYSTEM_IDENTITY_SOURCE } from '../constants/database';
import { getUserIdentifier, getUserIdentitySource } from './keycloak-utils';

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
  it('returns non null  response when null keycloakToken provided', () => {
    const response = getUserIdentitySource((null as unknown) as object);

    expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.DATABASE);
  });

  it('returns non null  response when valid keycloakToken provided with no preferred_username', () => {
    const response = getUserIdentitySource({});

    expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.DATABASE);
  });

  it('returns non null  response when valid keycloakToken provided with null preferred_username', () => {
    const response = getUserIdentitySource({ preferred_username: null });

    expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.DATABASE);
  });

  it('returns non null response when valid keycloakToken provided with no source', () => {
    const response = getUserIdentitySource({ preferred_username: 'username' });

    expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.DATABASE);
  });

  it('returns non null response when valid keycloakToken provided with idir source', () => {
    const response = getUserIdentitySource({ preferred_username: 'username@idir' });

    expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.IDIR);
  });

  it('returns non null response when valid keycloakToken provided with bceid source', () => {
    const response = getUserIdentitySource({ preferred_username: 'username@bceid-basic-and-business' });

    expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.BCEID);
  });

  it('returns non null response when valid keycloakToken provided with database source', () => {
    const response = getUserIdentitySource({ preferred_username: 'username@database' });

    expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.DATABASE);
  });
});
