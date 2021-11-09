import { expect } from 'chai';
import { describe } from 'mocha';
import { getProjectParticipationBySystemUserSQL } from './project-participation-queries';

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
