import { SYSTEM_IDENTITY_SOURCE } from 'constants/auth';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import {
  buildUrl,
  dateRangesOverlap,
  ensureProtocol,
  getFormattedAmount,
  getFormattedDate,
  getFormattedDateRangeString,
  getFormattedFileSize,
  getFormattedIdentitySource,
  getTitle,
  pluralize
} from './Utils';

describe('ensureProtocol', () => {
  it('upgrades the URL if string begins with `http://`', async () => {
    const urlWithProtocol = ensureProtocol('http://someurl.com');
    expect(urlWithProtocol).toEqual('https://someurl.com');
  });

  it('does nothing if string already has `https://`', async () => {
    const url = 'https://someurl.com';
    const urlWithProtocol = ensureProtocol(url);
    expect(urlWithProtocol).toEqual(url);
  });

  it('adds http if string begins with `localhost`', async () => {
    const urlWithProtocol = ensureProtocol('localhost:1234/test');
    expect(urlWithProtocol).toEqual('http://localhost:1234/test');
  });

  it('does nothing if string begins with `http://localhost`', async () => {
    const urlWithProtocol = ensureProtocol('http://localhost:1234/test');
    expect(urlWithProtocol).toEqual('http://localhost:1234/test');
  });

  it('adds `https://` when no protocol param is provided', async () => {
    const url = 'someurl.com';
    const urlWithProtocol = ensureProtocol(url);
    expect(urlWithProtocol).toEqual(`https://${url}`);
  });

  it('adds `https://` when provided', async () => {
    const url = 'someurl.com';
    const urlWithProtocol = ensureProtocol(url, 'https://');
    expect(urlWithProtocol).toEqual(`https://${url}`);
  });

  it('adds `http://` when provided', async () => {
    const url = 'someurl.com';
    const urlWithProtocol = ensureProtocol(url, 'http://');
    expect(urlWithProtocol).toEqual(`http://${url}`);
  });
});

describe('buildUrl', () => {
  it('should build a basic URL', () => {
    const url = buildUrl('a', 'b', 'c', 'd');

    expect(url).toEqual('a/b/c/d');
  });

  it('should build a URL to the app root', () => {
    const url = buildUrl('/');

    expect(url).toEqual('/');
  });

  it('should filter out falsey url parts', () => {
    const url = buildUrl('a', 'b', null as unknown as string, 'd', undefined, 'f');

    expect(url).toEqual('a/b/d/f');
  });

  it('should filter out double slashes', () => {
    const url = buildUrl('a', '//', 'b', '/c', '/d/', '/f/');

    expect(url).toEqual('a/b/c/d/f/');
  });

  it('should filter out whitespace', () => {
    const url = buildUrl('a', '     ', '   c  ', ' /d ', '/e/ ', ' /f');

    expect(url).toEqual('a/c/d/e/f');
  });

  it('should respect HTTP(S) protocol', () => {
    const url = buildUrl('http://a', '/b', 'c', '/d/');

    expect(url).toEqual('http://a/b/c/d/');
  });
});

describe('getFormattedAmount', () => {
  it('returns a valid amount string when amount is valid', () => {
    const amount = 10000000;
    expect(getFormattedAmount(amount)).toEqual('$10,000,000');
  });

  it('returns empty string when amount is invalid', () => {
    expect(getFormattedAmount(null as unknown as number)).toEqual('');
  });
});

describe('getFormattedDate', () => {
  beforeAll(() => {
    // ignore warning about invalid date string being passed to dayjs
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('returns empty string if invalid date is provided', async () => {
    const date = 'INVALID DATE STRING';
    const formattedDateString = getFormattedDate(DATE_FORMAT.MediumDateFormat, date);
    expect(formattedDateString).toEqual('');
  });

  it('returns formatted date string if valid date is provided', async () => {
    const date = '2021-03-04T22:44:55.478682';
    const formattedDateString = getFormattedDate(DATE_FORMAT.MediumDateFormat, date);
    expect(formattedDateString).toEqual('March 4, 2021');
  });
});

describe('getFormattedDateRangeString', () => {
  beforeAll(() => {
    // ignore warning about invalid date string being passed to dayjs
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('returns empty string if invalid startDate is provided', async () => {
    const startDate = 'INVALID DATE STRING';
    const formattedDateString = getFormattedDateRangeString(DATE_FORMAT.MediumDateFormat, startDate);
    expect(formattedDateString).toEqual('');
  });

  it('returns empty string if invalid endDate is provided', async () => {
    const startDate = '2021-03-04T22:44:55.478682';
    const endDate = 'INVALID DATE STRING';
    const formattedDateString = getFormattedDateRangeString(DATE_FORMAT.MediumDateFormat, startDate, endDate);
    expect(formattedDateString).toEqual('');
  });

  it('returns formatted string if valid startDate is provided', async () => {
    const startDate = '2021-03-04T22:44:55.478682';
    const formattedDateString = getFormattedDateRangeString(DATE_FORMAT.MediumDateFormat, startDate);
    expect(formattedDateString).toEqual('March 4, 2021');
  });

  it('returns formatted string if valid startDate is provided', async () => {
    const startDate = '2021-03-04T22:44:55.478682';
    const endDate = '2021-05-25T22:44:55.478682';
    const formattedDateString = getFormattedDateRangeString(DATE_FORMAT.MediumDateFormat, startDate, endDate);
    expect(formattedDateString).toEqual('March 4, 2021 - May 25, 2021');
  });

  it('returns formatted string with custom dateSeparator', async () => {
    const startDate = '2021-03-04T22:44:55.478682';
    const endDate = '2021-05-25T22:44:55.478682';
    const formattedDateString = getFormattedDateRangeString(DATE_FORMAT.MediumDateFormat, startDate, endDate, '//');
    expect(formattedDateString).toEqual('March 4, 2021 // May 25, 2021');
  });
});

describe('getFormattedFileSize', () => {
  it('returns `0 KB` if no file size exists', async () => {
    const formattedFileSize = getFormattedFileSize(null as unknown as number);
    expect(formattedFileSize).toEqual('0 KB');
  });

  it('returns answer in KB if fileSize < 1000000', async () => {
    const formattedFileSize = getFormattedFileSize(20000);
    expect(formattedFileSize).toEqual('20.0 KB');
  });

  it('returns answer in MB if fileSize < 1000000000', async () => {
    const formattedFileSize = getFormattedFileSize(200000000);
    expect(formattedFileSize).toEqual('200.0 MB');
  });

  it('returns answer in GB if fileSize >= 1000000000', async () => {
    const formattedFileSize = getFormattedFileSize(1000000000);
    expect(formattedFileSize).toEqual('1.0 GB');
  });
});

describe('getFormattedIdentitySource', () => {
  it('returns BCeID Basic', () => {
    const result = getFormattedIdentitySource(SYSTEM_IDENTITY_SOURCE.BCEID_BASIC);

    expect(result).toEqual('BCeID Basic');
  });

  it('returns BCeID Business', () => {
    const result = getFormattedIdentitySource(SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS);

    expect(result).toEqual('BCeID Business');
  });

  it('returns IDIR', () => {
    const result = getFormattedIdentitySource(SYSTEM_IDENTITY_SOURCE.IDIR);

    expect(result).toEqual('IDIR');
  });

  it('returns IDIR', () => {
    const result = getFormattedIdentitySource(SYSTEM_IDENTITY_SOURCE.DATABASE);

    expect(result).toEqual('System');
  });

  it('returns null for unknown identity source', () => {
    const result = getFormattedIdentitySource('__default_test_string' as SYSTEM_IDENTITY_SOURCE);

    expect(result).toEqual(null);
  });

  it('returns null for null identity source', () => {
    const result = getFormattedIdentitySource(null as unknown as SYSTEM_IDENTITY_SOURCE);

    expect(result).toEqual(null);
  });
});

describe('getTitle', () => {
  it('should return a title when no pageName is given', () => {
    const title = getTitle();

    expect(title).toEqual('SIMS');
  });

  it('should return a title when empty string is given', () => {
    const title = getTitle('');

    expect(title).toEqual('SIMS');
  });

  it('should return a title when a pageName is given', () => {
    const title = getTitle('Test Page');

    expect(title).toEqual('SIMS - Test Page');
  });
});

describe('pluralize', () => {
  it('pluralizes a word', () => {
    const response = pluralize(2, 'apple');
    expect(response).toEqual('apples');
  });

  it('pluralizes a word with undefined quantity', () => {
    const response = pluralize(null as unknown as number, 'orange');
    expect(response).toEqual('oranges');
  });

  it('does not pluralize a single item', () => {
    const response = pluralize(1, 'banana');
    expect(response).toEqual('banana');
  });

  it('pluralizes a word with a custom suffix', () => {
    const response = pluralize(10, 'berr', 'y', 'ies');
    expect(response).toEqual('berries');
  });

  it('does not pluralize a word with a custom suffix and single quantity', () => {
    const response = pluralize(1, 'berr', 'y', 'ies');
    expect(response).toEqual('berry');
  });
});

describe('dateRangesOverlap', () => {
  it('should return false for non-overlapping dates', () => {
    const response = dateRangesOverlap('2023-01-01', '2023-01-02', '2023-03-03', '2023-04-04');
    expect(response).toEqual(false);
  });

  it('should return true for overlapping dates without optional params', () => {
    const response = dateRangesOverlap('2019-12-12', null, '2023-01-01', '2023-03-03');
    expect(response).toEqual(true);
  });

  it('should return true for overlapping dates with optional params', () => {
    const response = dateRangesOverlap('2023-01-01', '2023-01-02', '2023-01-01', '2023-03-03');
    expect(response).toEqual(true);
  });
});
