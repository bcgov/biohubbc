import { expect } from 'chai';
import { describe } from 'mocha';
import { SYSTEM_IDENTITY_SOURCE } from '../../constants/database';
import { setSystemUserContextSQL } from './user-context-queries';

describe('setSystemUserContextSQL', () => {
  it('has empty userIdentifier', () => {
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

  it('identifies a database user', () => {
    const response = setSystemUserContextSQL('database-user', SYSTEM_IDENTITY_SOURCE.DATABASE);

    expect(response).not.to.be.null;
  });

  it('identifies a system user', () => {
    const response = setSystemUserContextSQL('system-user', SYSTEM_IDENTITY_SOURCE.SYSTEM);

    expect(response).not.to.be.null;
  });
});
