import { DATE_FORMAT } from 'constants/dateFormats';
import { ensureProtocol, getFormattedAmount, getFormattedDate, getFormattedDateRangeString, logOut } from './Utils';

describe('ensureProtocol', () => {
  it('does nothing if string already has `http://`', async () => {
    const url = 'http://someurl.com';
    const urlWithProtocol = ensureProtocol(url);
    expect(urlWithProtocol).toEqual(url);
  });

  it('does nothing if string already has `https://`', async () => {
    const url = 'https://someurl.com';
    const urlWithProtocol = ensureProtocol(url);
    expect(urlWithProtocol).toEqual(url);
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

describe('getFormattedAmount', () => {
  it('returns a valid amount string when amount is valid', () => {
    const amount = 10000000;
    expect(getFormattedAmount(amount)).toEqual('$ 10,000,000');
  });

  it('returns empty string when amount is invalid', () => {
    expect(getFormattedAmount((null as unknown) as number)).toEqual('');
  });
});

describe('getFormattedDate', () => {
  beforeAll(() => {
    // ignore warning about invalid date string being passed to moment
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('returns empty string if invalid date is provided', async () => {
    const date = '12312312312312312';
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
    // ignore warning about invalid date string being passed to moment
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('returns empty string if invalid startDate is provided', async () => {
    const startDate = '12312312312312312';
    const formattedDateString = getFormattedDateRangeString(DATE_FORMAT.MediumDateFormat, startDate);
    expect(formattedDateString).toEqual('');
  });

  it('returns empty string if invalid endDate is provided', async () => {
    const startDate = '2021-03-04T22:44:55.478682';
    const endDate = '12312312312312312';
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

describe('logOut', () => {
  const { location } = window;

  let replace = jest.fn();

  beforeEach(() => {
    // @ts-ignore
    delete window.location;

    // @ts-ignore
    window.location = {
      href: '',
      origin: 'https://biohub.com',
      replace: replace
    };
  });

  afterEach(() => {
    window.location = location;

    jest.clearAllMocks();
  });

  it('should not logout when config is missing `KEYCLOAK_CONFIG.url`', () => {
    const config = {
      API_HOST: '',
      CHANGE_VERSION: '',
      NODE_ENV: '',
      VERSION: '',
      KEYCLOAK_CONFIG: {
        url: '',
        realm: 'myrealm',
        clientId: ''
      },
      SITEMINDER_LOGOUT_URL: 'https://www.siteminderlogout.com'
    };

    logOut(config);

    expect(replace).not.toHaveBeenCalled();
  });

  it('should not logout when config is missing `KEYCLOAK_CONFIG.realm`', () => {
    const config = {
      API_HOST: '',
      CHANGE_VERSION: '',
      NODE_ENV: '',
      VERSION: '',
      KEYCLOAK_CONFIG: {
        url: 'https://www.keycloaklogout.com/auth',
        realm: '',
        clientId: ''
      },
      SITEMINDER_LOGOUT_URL: 'https://www.siteminderlogout.com'
    };

    logOut(config);

    expect(replace).not.toHaveBeenCalled();
  });

  it('should not logout when config is missing `SITEMINDER_LOGOUT_URL`', () => {
    const config = {
      API_HOST: '',
      CHANGE_VERSION: '',
      NODE_ENV: '',
      VERSION: '',
      KEYCLOAK_CONFIG: {
        url: 'https://www.keycloaklogout.com/auth',
        realm: 'myrealm',
        clientId: ''
      },
      SITEMINDER_LOGOUT_URL: ''
    };

    logOut(config);

    expect(replace).not.toHaveBeenCalled();
  });

  it('should change the location.href appropriately on logout success', () => {
    const config = {
      API_HOST: '',
      CHANGE_VERSION: '',
      NODE_ENV: '',
      VERSION: '',
      KEYCLOAK_CONFIG: {
        url: 'https://www.keycloaklogout.com/auth',
        realm: 'myrealm',
        clientId: ''
      },
      SITEMINDER_LOGOUT_URL: 'https://www.siteminderlogout.com'
    };

    logOut(config);

    expect(replace).toHaveBeenCalledWith(
      'https://www.siteminderlogout.com?returl=https://www.keycloaklogout.com/auth/realms/myrealm/protocol/openid-connect/logout?redirect_uri=https://biohub.com/login&retnow=1'
    );
  });
});
