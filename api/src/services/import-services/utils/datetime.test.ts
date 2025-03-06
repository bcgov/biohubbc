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

  it('should return undefined if dates are null', () => {
    expect(formatTimeString(null)).to.be.undefined;
    expect(formatTimeString(undefined)).to.be.undefined;
  });
});

describe('areDatesEqual', () => {
  const date1 = '2024-10-11';
  const date2 = '24-10-11';
  const date3 = '11-10-2024';
  const date4 = '11-10-24';

  const date5 = '2024/10/11';
  const date6 = '11/10/2024';
  const date7 = '24/10/11';
  const date8 = '11/10/24';

  it('should be true when dates are equal in all formats', () => {
    expect(areDatesEqual(date1, date5)).to.be.true;

    expect(areDatesEqual(date3, date4)).to.be.true;
    expect(areDatesEqual(date3, date6)).to.be.true;
    expect(areDatesEqual(date3, date8)).to.be.true;

    expect(areDatesEqual(date4, date6)).to.be.true;
    expect(areDatesEqual(date4, date8)).to.be.true;

    expect(areDatesEqual(date6, date8)).to.be.true;
  });

  it('should fail if dates are incorrect format', () => {
    expect(areDatesEqual(date1, date2)).to.be.false;
    expect(areDatesEqual(date1, date3)).to.be.false;
    expect(areDatesEqual(date1, date4)).to.be.false;
    expect(areDatesEqual(date1, date6)).to.be.false;
    expect(areDatesEqual(date1, date7)).to.be.false;
    expect(areDatesEqual(date1, date8)).to.be.false;
    expect(areDatesEqual(date2, date3)).to.be.false;

    expect(areDatesEqual(date2, date4)).to.be.false;
    expect(areDatesEqual(date2, date5)).to.be.false;
    expect(areDatesEqual(date2, date6)).to.be.false;
    expect(areDatesEqual(date2, date7)).to.be.false;
    expect(areDatesEqual(date2, date8)).to.be.false;

    expect(areDatesEqual(date3, date5)).to.be.false;
    expect(areDatesEqual(date3, date7)).to.be.false;

    expect(areDatesEqual(date4, date5)).to.be.false;
    expect(areDatesEqual(date4, date7)).to.be.false;

    expect(areDatesEqual(date5, date6)).to.be.false;
    expect(areDatesEqual(date5, date7)).to.be.false;
    expect(areDatesEqual(date5, date8)).to.be.false;

    expect(areDatesEqual(date6, date7)).to.be.false;

    expect(areDatesEqual(date7, date8)).to.be.false;
  });
});
