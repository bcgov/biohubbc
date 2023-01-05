import { expect } from 'chai';
import { describe } from 'mocha';
import { getAllUserProjectsSQL } from './project-participation-queries';

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
