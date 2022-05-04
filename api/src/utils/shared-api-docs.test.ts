import { expect } from 'chai';
import { describe } from 'mocha';
import {
  addFundingSourceApiDocObject,
  attachmentApiDocObject,
  deleteFundingSourceApiDocObject
} from './shared-api-docs';

describe('attachmentApiResponseObject', () => {
  it('returns a valid response object', () => {
    const result = attachmentApiDocObject('basic', 'success');

    expect(result).to.not.be.null;
    expect(result?.description).to.equal('basic');
  });
});

describe('deleteFundingSourceApiDocObject', () => {
  it('returns a valid response object', () => {
    const result = deleteFundingSourceApiDocObject('basic', 'success');

    expect(result).to.not.be.null;
    expect(result?.description).to.equal('basic');
  });
});

describe('addFundingSourceApiDocObject', () => {
  it('returns a valid response object', () => {
    const result = addFundingSourceApiDocObject('basic', 'success');

    expect(result).to.not.be.null;
    expect(result?.description).to.equal('basic');
  });
});
