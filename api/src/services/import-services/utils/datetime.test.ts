import { expect } from 'chai';
import { formatTimeString } from './datetime';

describe('formatTimeString', () => {
  it('should correctly prepend leading 0 for 24 hour time', () => {
    expect(formatTimeString('9:10:10')).to.be.eql('09:10:10');
  });

  it('should correctly append 00 for missing seconds', () => {
    expect(formatTimeString('10:10')).to.be.eql('10:10:00');
  });

  it('should correctly append 00 for missing seconds and prepend 0 for 24 hour time', () => {
    expect(formatTimeString('9:10')).to.be.eql('09:10:00');
  });

  it('should return undefined if cannot format time', () => {
    expect(formatTimeString('BLAH')).to.be.undefined;
  });
});
