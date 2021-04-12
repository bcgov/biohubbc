import { expect } from 'chai';
import { describe } from 'mocha';
import { SYSTEM_USER_TYPE } from '../constants/database';
import { setSystemUserContextSQL } from './user-context-queries';

describe('setSystemUserContextSQL', () => {
  it('has empty userIdentifier', () => {
    const response = setSystemUserContextSQL('', SYSTEM_USER_TYPE.IDIR);

    expect(response).to.be.null;
  });

  it('identifies an IDIR user', () => {
    const response = setSystemUserContextSQL('idir-user', SYSTEM_USER_TYPE.IDIR);

    expect(response).not.to.be.null;
  });

  it('identifies a BCEID user', () => {
    const response = setSystemUserContextSQL('bceid-user', SYSTEM_USER_TYPE.BCEID);

    expect(response).not.to.be.null;
  });
});
