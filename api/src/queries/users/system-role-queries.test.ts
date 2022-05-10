import { expect } from 'chai';
import { describe } from 'mocha';
import { postSystemRolesSQL } from './system-role-queries';

describe('postSystemRolesSQL', () => {
  it('returns null response when null userId provided', () => {
    const response = postSystemRolesSQL((null as unknown) as number, [1]);

    expect(response).to.be.null;
  });

  it('returns null response when null roleIds provided', () => {
    const response = postSystemRolesSQL(1, (null as unknown) as number[]);

    expect(response).to.be.null;
  });

  it('returns null response when empty roleIds provided', () => {
    const response = postSystemRolesSQL(1, []);

    expect(response).to.be.null;
  });

  it('returns non null response when valid parameters provided', () => {
    const response = postSystemRolesSQL(1, [1, 2]);

    expect(response).to.not.be.null;
  });
});
