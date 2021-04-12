import { expect } from 'chai';
import { describe } from 'mocha';
import { getAttachmentApiDocObject } from './shared-api-docs';

describe('getAttachmentApiResponseObject', () => {
  it('returns a valid response object', () => {
    const result = getAttachmentApiDocObject('basic', 'success');

    expect(result).to.not.be.null;
    expect(result?.description).to.equal('basic');
  });
});
