import { expect } from 'chai';
import { describe } from 'mocha';
import {
  deleteProjectParticipationSQL,
  getAllProjectParticipants,
  getProjectParticipationBySystemUserSQL,
  postProjectRolesByRoleNameSQL
} from './project-participation-queries';

describe('getProjectParticipationBySystemUserSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = getProjectParticipationBySystemUserSQL((null as unknown) as number, 2);

    expect(response).to.be.null;
  });

  it('returns null response when null systemUserId provided', () => {
    const response = getProjectParticipationBySystemUserSQL(1, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when null valid params provided', () => {
    const response = getProjectParticipationBySystemUserSQL(1, 2);

    expect(response).to.not.be.null;
  });
});

describe('getAllProjectParticipants', () => {
  it('returns null response when null projectId provided', () => {
    const response = getAllProjectParticipants((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns null response when valid params provided', () => {
    const response = getAllProjectParticipants(1);

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

describe('deleteProjectParticipationSQL', () => {
  it('returns null response when null projectParticipationId provided', () => {
    const response = deleteProjectParticipationSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid parameters provided', () => {
    const response = deleteProjectParticipationSQL(1);

    expect(response).to.not.be.null;
  });
});
