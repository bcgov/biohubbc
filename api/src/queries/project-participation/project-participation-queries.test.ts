import { expect } from 'chai';
import { describe } from 'mocha';
import {
  getAllUserProjectsSQL,
  deleteProjectParticipationSQL,
  getAllProjectParticipantsSQL,
  getProjectParticipationBySystemUserSQL,
  addProjectRoleByRoleNameSQL
} from './project-participation-queries';

describe('getAllUserProjectsSQL', () => {
  it('returns null response when null userId provided', () => {
    const response = getAllUserProjectsSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when null valid params provided', () => {
    const response = getAllUserProjectsSQL(1);

    expect(response).to.not.be.null;
  });
});

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

describe('getAllProjectParticipantsSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = getAllProjectParticipantsSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns null response when valid params provided', () => {
    const response = getAllProjectParticipantsSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('addProjectRoleByRoleNameSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = addProjectRoleByRoleNameSQL((null as unknown) as number, 2, 'role');

    expect(response).to.be.null;
  });

  it('returns null response when null systemUserId provided', () => {
    const response = addProjectRoleByRoleNameSQL(1, (null as unknown) as number, 'role');

    expect(response).to.be.null;
  });

  it('returns null response when null/empty projectParticipantRole provided', () => {
    const response = addProjectRoleByRoleNameSQL(1, 2, '');

    expect(response).to.be.null;
  });

  it('returns non null response when valid parameters provided', () => {
    const response = addProjectRoleByRoleNameSQL(1, 2, 'role');

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
