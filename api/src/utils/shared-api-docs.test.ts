import { expect } from 'chai';
import { describe } from 'mocha';
import {
  getAttachmentApiDocObject,
  deleteFundingSourceApiDocObject,
  addFundingSourceApiDocObject
} from './shared-api-docs';

describe('getAttachmentApiResponseObject', () => {
  it('returns a valid response object', () => {
    const result = getAttachmentApiDocObject('basic', 'success');

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
