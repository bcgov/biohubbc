import { expect } from 'chai';
import { describe } from 'mocha';
import { SYSTEM_IDENTITY_SOURCE } from '../../constants/database';
import { patchUserGuidSQL, setSystemUserContextSQL } from './user-context-queries';

describe('setSystemUserContextSQL', () => {
  it('has empty userGuid', () => {
    const response = setSystemUserContextSQL('', SYSTEM_IDENTITY_SOURCE.IDIR);

    expect(response).to.be.null;
  });

  it('identifies an IDIR user', () => {
    const response = setSystemUserContextSQL('idir-user', SYSTEM_IDENTITY_SOURCE.IDIR);

    expect(response).not.to.be.null;
  });

  it('identifies a BCEID basic user', () => {
    const response = setSystemUserContextSQL('bceid-basic-user', SYSTEM_IDENTITY_SOURCE.BCEID_BASIC);

    expect(response).not.to.be.null;
  });

  it('identifies a BCEID business user', () => {
    const response = setSystemUserContextSQL('bceid-business-user', SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS);

    expect(response).not.to.be.null;
  });
});

describe('patchUserGuidSQL', () => {
  it('returns null if no userGuid is provided', () => {
    const response = patchUserGuidSQL('', 'user-identifier', SYSTEM_IDENTITY_SOURCE.IDIR);
    expect(response).not.to.be.null;
  });

  it('returns null if no userIdentifier is provided', () => {
    const response = patchUserGuidSQL('user-guid', '', SYSTEM_IDENTITY_SOURCE.IDIR);
    expect(response).not.to.be.null;
  });

  it('returns null if no identity source is provided', () => {
    const response = patchUserGuidSQL('user-guid', 'user-identifier', null as unknown as SYSTEM_IDENTITY_SOURCE);
    expect(response).not.to.be.null;
  });

  it('identifies an IDIR user', () => {
    const response = patchUserGuidSQL('user-guid', 'user-identifier', SYSTEM_IDENTITY_SOURCE.IDIR);
    expect(response).not.to.be.null;
  });

  it('identifies a BCEID basic user', () => {
    const response = patchUserGuidSQL('user-guid', 'user-identifier', SYSTEM_IDENTITY_SOURCE.BCEID_BASIC);
    expect(response).not.to.be.null;
  });

  it('identifies a BCEID business user', () => {
    const response = patchUserGuidSQL('user-guid', 'user-identifier', SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS);
    expect(response).not.to.be.null;
  });
});
