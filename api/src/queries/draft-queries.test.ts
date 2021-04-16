import { expect } from 'chai';
import { describe } from 'mocha';
import { deleteDraftSQL, getDraftSQL, getDraftsSQL, postDraftSQL, putDraftSQL } from './draft-queries';

describe('postDraftSQL', () => {
  it('Null systemUserId', () => {
    const response = postDraftSQL((null as unknown) as number, 'draft name', {});
    expect(response).to.be.null;
  });

  it('Null name', () => {
    const response = postDraftSQL(1, (null as unknown) as string, {});
    expect(response).to.be.null;
  });

  it('Null data', () => {
    const response = postDraftSQL(1, 'draft name', (null as unknown) as object);
    expect(response).to.be.null;
  });

  it('null systemUserId and null name and null data', () => {
    const response = postDraftSQL(
      (null as unknown) as number,
      (null as unknown) as string,
      (null as unknown) as object
    );
    expect(response).to.be.null;
  });

  it('Valid parameters', () => {
    const response = postDraftSQL(1, 'draft name', {});
    expect(response).to.not.be.null;
  });
});

describe('putDraftSQL', () => {
  it('Null id', () => {
    const response = putDraftSQL((null as unknown) as number, 'draft name', {});
    expect(response).to.be.null;
  });

  it('Null name', () => {
    const response = putDraftSQL(1, (null as unknown) as string, {});
    expect(response).to.be.null;
  });

  it('Null data', () => {
    const response = putDraftSQL(1, 'draft name', (null as unknown) as object);
    expect(response).to.be.null;
  });

  it('null id and null name and null data', () => {
    const response = putDraftSQL((null as unknown) as number, (null as unknown) as string, (null as unknown) as object);
    expect(response).to.be.null;
  });

  it('Valid parameters', () => {
    const response = putDraftSQL(1, 'draft name', {});
    expect(response).to.not.be.null;
  });
});

describe('getDraftsSQL', () => {
  it('Null systemUserId', () => {
    const response = getDraftsSQL((null as unknown) as number);
    expect(response).to.be.null;
  });

  it('Valid parameters', () => {
    const response = getDraftsSQL(1);
    expect(response).to.not.be.null;
  });
});

describe('getDraftSQL', () => {
  it('Null draftId', () => {
    const response = getDraftSQL((null as unknown) as number);
    expect(response).to.be.null;
  });

  it('Valid parameters', () => {
    const response = getDraftSQL(1);
    expect(response).to.not.be.null;
  });
});

describe('deleteDraftSQL', () => {
  it('Null draftId', () => {
    const response = deleteDraftSQL((null as unknown) as number);
    expect(response).to.be.null;
  });

  it('Valid parameters', () => {
    const response = deleteDraftSQL(1);
    expect(response).to.not.be.null;
  });
});
