import { combineDateTime, combineDateTimeUtc, formatTimeDifference, formatTimestampUtc } from './datetime';

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

describe('combineDateTimeUtc', () => {
  beforeAll(() => {
    // Pin a non-UTC timezone so a browser-local-parse regression cannot pass on UTC CI machines
    vi.stubEnv('TZ', 'America/Vancouver');
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it('treats the incoming date and time as UTC (no browser-local shift)', () => {
    const result = combineDateTimeUtc('2024-01-01', '22:30:00');
    expect(result).toEqual('2024-01-01T22:30:00.000Z');
  });

  it('does not shift the date across the local-timezone midnight boundary', () => {
    const result = combineDateTimeUtc('2024-01-01', '23:59:59');
    expect(result).toEqual('2024-01-01T23:59:59.000Z');
  });

  it('is not affected by daylight savings offsets', () => {
    const result = combineDateTimeUtc('2024-07-01', '22:30:00');
    expect(result).toEqual('2024-07-01T22:30:00.000Z');
  });
});

describe('formatTimestampUtc', () => {
  beforeAll(() => {
    // Pin a non-UTC timezone so a browser-local-render regression cannot pass on UTC CI machines
    vi.stubEnv('TZ', 'America/Vancouver');
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it('renders a UTC-offset postgres timestamp in UTC', () => {
    const result = formatTimestampUtc('2024-01-01 22:30:00+00', 'HH:mm:ss');
    expect(result).toEqual('22:30:00');
  });

  it('renders a non-UTC-offset postgres timestamp as its UTC equivalent', () => {
    const result = formatTimestampUtc('2024-01-01 14:30:00-08', 'YYYY-MM-DD HH:mm:ss');
    expect(result).toEqual('2024-01-01 22:30:00');
  });

  it('renders the UTC calendar date across local date boundaries', () => {
    const result = formatTimestampUtc('2024-01-02 03:30:00+00', 'YYYY-MM-DD');
    expect(result).toEqual('2024-01-02');
  });

  it('handles microsecond precision from timestamptz(6)', () => {
    const result = formatTimestampUtc('2024-01-01 22:30:00.123456+00', 'HH:mm:ss');
    expect(result).toEqual('22:30:00');
  });

  it('returns an empty string for null, undefined or invalid input', () => {
    expect(formatTimestampUtc(null, 'HH:mm:ss')).toEqual('');
    expect(formatTimestampUtc(undefined, 'HH:mm:ss')).toEqual('');
    expect(formatTimestampUtc('not-a-date', 'HH:mm:ss')).toEqual('');
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
