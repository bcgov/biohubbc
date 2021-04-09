import { expect } from 'chai';
import { describe } from 'mocha';
import { getAttachmentApiResponseObject } from './shared-api-responses';

describe('getAttachmentApiResponseObject', () => {
  it('returns null when no basic description specified', () => {
    const result = getAttachmentApiResponseObject((null as unknown) as string, 'success');

    expect(result).to.be.null;
  });

  it('returns null when no success description specified', () => {
    const result = getAttachmentApiResponseObject('basic', (null as unknown) as string);

    expect(result).to.be.null;
  });

  it('returns a valid response object when all fields specified', () => {
    const result = getAttachmentApiResponseObject('basic', 'success');

    expect(result).to.not.be.null;
    expect(result?.description).to.equal('basic');
  });
});
