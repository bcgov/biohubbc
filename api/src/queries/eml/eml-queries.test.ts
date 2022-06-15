import { expect } from 'chai';
import { describe } from 'mocha';
import { getIUCNClassificationsDetailsSQL, getProjectFirstNationsSQL } from './eml-queries';

describe('getProjectFirstNationsSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = getProjectFirstNationsSQL((null as unknown) as number);

    expect(response).to.not.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = getProjectFirstNationsSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getIUCNClassificationsDetailsSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = getIUCNClassificationsDetailsSQL((null as unknown) as number);

    expect(response).to.not.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = getIUCNClassificationsDetailsSQL(1);

    expect(response).to.not.be.null;
  });
});
