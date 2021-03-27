import { expect } from 'chai';
import { describe } from 'mocha';
import { deleteAncillarySpeciesSQL, deleteFocalSpeciesSQL, deleteIUCNSQL } from './project-delete-queries';

describe('deleteIUCNSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = deleteIUCNSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = deleteIUCNSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteFocalSpeciesSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = deleteFocalSpeciesSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = deleteFocalSpeciesSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteAncillarySpeciesSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = deleteAncillarySpeciesSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = deleteAncillarySpeciesSQL(1);

    expect(response).to.not.be.null;
  });
});
