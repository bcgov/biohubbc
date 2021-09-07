import { expect } from 'chai';
import { describe } from 'mocha';
import { MediaFile } from '../media-file';
import { XLSXCSV } from './xlsx-file';

describe('XLSXCSV', () => {
  it('constructs', () => {
    const mediaFile: MediaFile = new MediaFile('fileName', 'mimetype', Buffer.from(''));

    const xlsxCSV = new XLSXCSV(mediaFile);

    expect(xlsxCSV).not.to.be.null;
  });
});
