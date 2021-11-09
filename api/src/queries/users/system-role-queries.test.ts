import { expect } from 'chai';
import { describe } from 'mocha';
import { deleteSystemRolesSQL, postProjectRolesByRoleNameSQL, postSystemRolesSQL } from './system-role-queries';

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

describe('deleteSystemRolesSQL', () => {
  it('returns null response when null userId provided', () => {
    const response = deleteSystemRolesSQL((null as unknown) as number, [1]);

    expect(response).to.be.null;
  });

  it('returns null response when null roleIds provided', () => {
    const response = deleteSystemRolesSQL(1, (null as unknown) as number[]);

    expect(response).to.be.null;
  });

  it('returns null response when empty roleIds provided', () => {
    const response = deleteSystemRolesSQL(1, []);

    expect(response).to.be.null;
  });

  it('returns non null response when valid parameters provided', () => {
    const response = deleteSystemRolesSQL(1, [1, 2]);

    expect(response).to.not.be.null;
  });
});

describe('postProjectRolesByRoleNameSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = postProjectRolesByRoleNameSQL((null as unknown) as number, 2, 'role');

    expect(response).to.be.null;
  });

  it('returns null response when null systemUserId provided', () => {
    const response = postProjectRolesByRoleNameSQL(1, (null as unknown) as number, 'role');

    expect(response).to.be.null;
  });

  it('returns null response when null/empty projectParticipantRole provided', () => {
    const response = postProjectRolesByRoleNameSQL(1, 2, '');

    expect(response).to.be.null;
  });

  it('returns non null response when valid parameters provided', () => {
    const response = postProjectRolesByRoleNameSQL(1, 2, 'role');

    expect(response).to.not.be.null;
  });
});
