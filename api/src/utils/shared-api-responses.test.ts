import { expect } from 'chai';
import { describe } from 'mocha';
import { getAttachmentApiResponseObject } from './shared-api-docs';

describe('getAttachmentApiResponseObject', () => {
  it('returns a valid response object', () => {
    const result = getAttachmentApiResponseObject('basic', 'success');

    expect(result).to.not.be.null;
    expect(result?.description).to.equal('basic');
  });
});
