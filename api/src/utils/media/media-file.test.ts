import { expect } from 'chai';
import { describe } from 'mocha';
import { MediaFile } from './media-file';

describe('MediaFile', () => {
  it('constructs', () => {
    const mediaFile = new MediaFile('fileName', 'mimetype', Buffer.from(''));

    expect(mediaFile).not.to.be.null;
    expect(mediaFile.fileName).to.equal('filename');
    expect(mediaFile.mimetype).to.equal('mimetype');
    expect(mediaFile.buffer).to.deep.equal(Buffer.from(''));
  });

  describe('name', () => {
    it('returns the name of the file', () => {
      const mediaFile = new MediaFile('fileName', 'mimetype', Buffer.from(''));

      expect(mediaFile.name).to.equal('filename');
    });

    it('returns the name of the file without the extension', () => {
      const mediaFile = new MediaFile('fileName.ext', 'mimetype', Buffer.from(''));

      expect(mediaFile.name).to.equal('filename');
    });
  });
});
