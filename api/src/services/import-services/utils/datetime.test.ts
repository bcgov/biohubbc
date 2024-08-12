import { expect } from 'chai';
import { areDatesEqual, formatTimeString } from './datetime';

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

describe('areDatesEqual', () => {
  it('should be true when dates are equal in all formats', () => {
    expect(areDatesEqual('10-10-2024', '10-10-2024')).to.be.true;
    expect(areDatesEqual('10-10-2024', '10/10/2024')).to.be.true;
    expect(areDatesEqual('10-10-2024', '10/10/24')).to.be.true;
    expect(areDatesEqual('10-10-2024', '2024-10-10')).to.be.true;
  });

  it('should fail if dates are incorrect format', () => {
    expect(areDatesEqual('BAD DATE BAD', '10/10/2024')).to.be.false;
  });
});
