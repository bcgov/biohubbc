import { expect } from 'chai';
import { describe } from 'mocha';
import {
  activateSystemUserSQL,
  addSystemUserSQL,
  deactivateSystemUserSQL,
  deleteAllProjectRolesSQL,
  deleteAllSystemRolesSQL,
  getUserByIdSQL,
  getUserByUserIdentifierSQL,
  getUserListSQL
} from './user-queries';

describe('getUserByUserIdentifierSQL', () => {
  it('returns null response when null userIdentifier provided', () => {
    const response = getUserByUserIdentifierSQL((null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns non null response when valid userIdentifier provided', () => {
    const response = getUserByUserIdentifierSQL('aUserName');

    expect(response).to.not.be.null;
  });
});

describe('getUserByIdSQL', () => {
  it('returns null response when null userId provided', () => {
    const response = getUserByIdSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid userId provided', () => {
    const response = getUserByIdSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getUserListSQL', () => {
  it('returns the expected response', () => {
    const response = getUserListSQL();

    expect(response).to.not.be.null;
  });
});

describe('addSystemUserSQL', () => {
  it('returns null response when null userIdentifier provided', () => {
    const response = addSystemUserSQL((null as unknown) as string, 'validString');

    expect(response).to.be.null;
  });

  it('returns null response when null identitySource provided', () => {
    const response = addSystemUserSQL('validString', (null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns null response when null userIdentifier provided', () => {
    const response = addSystemUserSQL((null as unknown) as string, 'validString');

    expect(response).to.be.null;
  });

  it('returns non null response when valid parameters provided', () => {
    const response = addSystemUserSQL('validString', 'validString');

    expect(response).to.not.be.null;
  });
});

describe('deactivateSystemUserSQL', () => {
  it('returns null response when null userIdentifier provided', () => {
    const response = deactivateSystemUserSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid parameters provided', () => {
    const response = deactivateSystemUserSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('activateSystemUserSQL', () => {
  it('returns null response when null userId provided', () => {
    const response = activateSystemUserSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid parameters provided', () => {
    const response = activateSystemUserSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteAllSystemRolesSQL', () => {
  it('returns null response when null userId provided', () => {
    const response = deleteAllSystemRolesSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid parameters provided', () => {
    const response = deleteAllSystemRolesSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteAllProjectRolesSQL', () => {
  it('returns null response when null userId provided', () => {
    const response = deleteAllProjectRolesSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid parameters provided', () => {
    const response = deleteAllProjectRolesSQL(1);

    expect(response).to.not.be.null;
  });
});
