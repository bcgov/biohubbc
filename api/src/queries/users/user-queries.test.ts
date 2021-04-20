import { expect } from 'chai';
import { describe } from 'mocha';
import { getUserByIdSQL, getUserByUserIdentifierSQL } from './user-queries';

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
