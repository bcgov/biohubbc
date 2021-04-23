import { expect } from 'chai';
import { describe } from 'mocha';
import { postAdministrativeActivitySQL } from './administrative-activity-queries';

describe('postAdministrativeActivitySQL', () => {
  it('Null systemUserId', () => {
    const response = postAdministrativeActivitySQL((null as unknown) as number, {});
    expect(response).to.be.null;
  });

  it('has null data', () => {
    const response = postAdministrativeActivitySQL((null as unknown) as number, null);
    expect(response).to.be.null;
  });

  it('Valid parameters', () => {
    const response = postAdministrativeActivitySQL(1, {});
    expect(response).to.not.be.null;
  });
});
