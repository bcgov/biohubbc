import { combineDateTime, formatTimeDifference } from './datetime';

describe('combineDateTime', () => {
  it('combines date and time into an ISO string', () => {
    const result = combineDateTime('2024-01-01', '12:30:00');
    expect(result).toEqual('2024-01-01T12:30:00');
  });

  it('combines date without time into an ISO string', () => {
    const result = combineDateTime('2024-01-01');
    expect(result).toEqual('2024-01-01T00:00:00');
  });

  it('returns ISO string for a different date and time', () => {
    const result = combineDateTime('2023-12-31', '23:59:59');
    expect(result).toEqual('2023-12-31T23:59:59');
  });

  it('handles invalid date formats gracefully', () => {
    const date = combineDateTime('badDate', '12:00');
    expect(date).toEqual('Invalid Date');

    const time = combineDateTime('2024-01-01', 'badtime');
    expect(time).toEqual('Invalid Date');
  });
});

describe('formatTimeDifference', () => {
  it('formats the time difference correctly between two dates and times', () => {
    const result = formatTimeDifference('2024-01-01', '12:00', '2024-01-02', '13:30');
    expect(result).toEqual('1 day and 1 hour');
  });

  it('handles time difference with only dates', () => {
    const result = formatTimeDifference('2024-01-01', null, '2024-01-03', null);
    expect(result).toEqual('2 days');
  });

  it('formats the time difference correctly with no time component', () => {
    const result = formatTimeDifference('2024-01-01', null, '2024-01-01', '01:00');
    expect(result).toEqual('1 hour');
  });

  it('returns null when there is no time difference', () => {
    const result = formatTimeDifference('2024-01-01', null, '2024-01-01', null);
    expect(result).toBeNull();
  });

  it('handles cases with invalid inputs', () => {
    const result = formatTimeDifference('invalid-date', null, '2024-01-01', null);
    expect(result).toBeNull();
  });
});
