import { assert, expect } from 'chai';
import { MediaBase64 } from '../../../../models/media';

describe('Unit Testing: POST /api/projects/{projectId}/artifacts/upload - Test MediaBase64 instantiation', () => {
  it('should throw an error when MediaBase64 is constructed with empty JSON', function () {
    const rawMedia: any = {};

    assert.throws(() => new MediaBase64(rawMedia));
  });

  it('should throw an error when MediaBase64 is constructed with corrupt encoded file content', function () {
    const rawMedia: any = {
      file_name: 'single_red_dot.png',
      encoded_file: 'dat....ge/png;ba...4,iVBORw0KG...'
    };

    assert.throws(() => new MediaBase64(rawMedia));
  });

  it('should return populated MediaBase64 object with expected values if input JSON object contains valid IMediaItem', function () {
    const rawMedia: any = {
      file_name: 'single_red_dot.png',
      encoded_file:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJgg'
    };
    const media: MediaBase64 = new MediaBase64(rawMedia);

    expect(media).to.be.an('object');
    expect(media.contentType).to.equal('image/png');
    expect(media.contentString).to.equal(
      'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJgg'
    );
    expect(media.mediaBuffer.toString('base64')).to.equal(media.contentString);
    expect(media.mediaName).to.equal(rawMedia.file_name);
  });
});
