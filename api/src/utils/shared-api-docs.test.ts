import { expect } from 'chai';
import { describe } from 'mocha';
import { attachmentApiDocObject } from './shared-api-docs';

describe('attachmentApiResponseObject', () => {
  it('returns a valid response object', () => {
    const result = attachmentApiDocObject('basic', 'success');

    expect(result).to.not.be.null;
    expect(result?.description).to.equal('basic');
  });
});
