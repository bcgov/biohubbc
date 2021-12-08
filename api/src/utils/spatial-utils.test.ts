import { expect } from 'chai';
import { describe } from 'mocha';
import { parseLatLongString, parseUTMString } from './spatial-utils';

describe('parseUTMString', () => {
  it('returns null when no UTM string provided', async () => {
    expect(parseUTMString((null as unknown) as string)).to.be.null;
    expect(parseUTMString('')).to.be.null;
  });

  it('returns null when provided UTM string has invalid format', () => {
    expect(parseUTMString('invalid format')).to.be.null;
    expect(parseUTMString('123 123 123')).to.be.null;
    expect(parseUTMString('573674 6114170')).to.be.null;
    expect(parseUTMString('9N 573674 6114170 Extra')).to.be.null;
    expect(parseUTMString('9NN 573674 6114170')).to.be.null;
  });

  it('returns null when UTM easting is too small', async () => {
    const result = parseUTMString('9N 0 6114170');

    expect(result).to.be.null;
  });

  it('returns null when UTM easting is too large', async () => {
    const result = parseUTMString('9N 99999999 6114170');

    expect(result).to.be.null;
  });

  it('returns null when UTM northing is too small, for the northern hemisphere', async () => {
    const result = parseUTMString('9N 573674 -1');

    expect(result).to.be.null;
  });

  it('returns null when UTM northing is too large, for the northern hemisphere', async () => {
    const result = parseUTMString('9N 573674 9334081');

    expect(result).to.be.null;
  });

  it('returns null when UTM northing is too small, for the southern hemisphere', async () => {
    const result = parseUTMString('9C 573674 1110399');

    expect(result).to.be.null;
  });

  it('returns null when UTM northing is too large, for the southern hemisphere', async () => {
    const result = parseUTMString('9C 573674 10000001');

    expect(result).to.be.null;
  });

  it('returns null when UTM zone number is too small', async () => {
    const result = parseUTMString('0N 573674 6114170');

    expect(result).to.be.null;
  });

  it('returns null when UTM zone number is too large', async () => {
    const result = parseUTMString('61N 573674 6114170');

    expect(result).to.be.null;
  });

  it('returns parsed UTM when UTM string is valid, but zone letter is missing', async () => {
    const result = parseUTMString('9 573674 6114170');

    expect(result).to.eql({
      easting: 573674,
      northing: 6114170,
      zone_letter: undefined,
      zone_number: 9,
      zone_srid: 32609
    });
  });

  it('returns parsed UTM when UTM string is valid, but zone letter is lowercase', async () => {
    const result = parseUTMString('9n 573674 6114170');

    expect(result).to.eql({ easting: 573674, northing: 6114170, zone_letter: 'N', zone_number: 9, zone_srid: 32609 });
  });

  it('returns parsed UTM when UTM string is valid for northern hemisphere', async () => {
    const result = parseUTMString('9N 573674 6114170');

    expect(result).to.eql({ easting: 573674, northing: 6114170, zone_letter: 'N', zone_number: 9, zone_srid: 32609 });
  });

  it('returns parsed UTM when UTM string is valid for southern hemisphere', async () => {
    const result = parseUTMString('18C 573674 6114170');

    expect(result).to.eql({ easting: 573674, northing: 6114170, zone_letter: 'C', zone_number: 18, zone_srid: 32718 });
  });
});

describe('parseLatLongString', () => {
  it('returns null when no LatLong string provided', async () => {
    expect(parseLatLongString((null as unknown) as string)).to.be.null;
    expect(parseLatLongString('')).to.be.null;
  });

  it('returns null when provided LatLong string has invalid format', () => {
    expect(parseLatLongString('49.1.2 -120')).to.be.null;
    expect(parseLatLongString('49.49 -120.1.2')).to.be.null;
    expect(parseLatLongString('badLatitude 120')).to.be.null;
    expect(parseLatLongString('-49 badLongitude')).to.be.null;
    expect(parseLatLongString('49 -120 extra')).to.be.null;
    expect(parseLatLongString('')).to.be.null;
    expect(parseLatLongString('not a lat long string')).to.be.null;
  });

  it('returns null when latitude is too small', async () => {
    const result = parseLatLongString('-91 0');

    expect(result).to.be.null;
  });

  it('returns null when latitude is too large', async () => {
    const result = parseLatLongString('91 0');

    expect(result).to.be.null;
  });

  it('returns null when longitude is too small', async () => {
    const result = parseLatLongString('0 -181');

    expect(result).to.be.null;
  });

  it('returns null when longitude is too large', async () => {
    const result = parseLatLongString('0 181');

    expect(result).to.be.null;
  });

  it('returns parsed lat long when lat long string is valid', async () => {
    const result = parseLatLongString('49.123 -120.123');

    expect(result).to.eql({ lat: 49.123, long: -120.123 });
  });
});
