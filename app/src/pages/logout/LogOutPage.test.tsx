import { cleanup, render } from '@testing-library/react';
import { ConfigContext, IConfig } from 'contexts/configContext';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import * as utils from 'utils/Utils';
import LogOutPage from './LogOutPage';

const history = createMemoryHistory();

describe('LogOutPage', () => {
  const { location } = window;

  let getLogOutUrlSpy: jest.SpyInstance;

  let replace = jest.fn();

  beforeAll(() => {
    // @ts-ignore
    delete window.location;

    // @ts-ignore
    window.location = {
      href: '',
      origin: 'https://restoration-tracker.com/logout',
      replace: replace
    };
  });

  afterAll(() => {
    window.location = location;

    getLogOutUrlSpy.mockClear();

    cleanup();
  });

  it('renders correctly and does not log the user out when config context is null', async () => {
    getLogOutUrlSpy = jest.spyOn(utils, 'getLogOutUrl').mockReturnValue('https://testLogOutURL.com');

    const { getByText } = render(
      <ConfigContext.Provider value={(null as unknown) as IConfig}>
        <Router history={history}>
          <LogOutPage />
        </Router>
      </ConfigContext.Provider>
    );

    expect(getByText('Logging out...')).toBeVisible();

    expect(window.location.replace).not.toHaveBeenCalled();
  });

  it('renders correctly and does not log the user out when the log out url is null', async () => {
    getLogOutUrlSpy = jest.spyOn(utils, 'getLogOutUrl').mockReturnValue('');

    const config = {
      API_HOST: '',
      CHANGE_VERSION: '',
      NODE_ENV: '',
      VERSION: '',
      KEYCLOAK_CONFIG: {
        url: 'https://www.mylogoutworks.com/auth',
        realm: 'myrealm',
        clientId: ''
      },
      SITEMINDER_LOGOUT_URL: 'https://www.siteminderlogout.com'
    };

    const { getByText } = render(
      <ConfigContext.Provider value={config}>
        <Router history={history}>
          <LogOutPage />
        </Router>
      </ConfigContext.Provider>
    );

    expect(getByText('Logging out...')).toBeVisible();

    expect(window.location.replace).not.toHaveBeenCalled();
  });

  it('renders correctly and logs the user out when config is valid', async () => {
    getLogOutUrlSpy = jest.spyOn(utils, 'getLogOutUrl').mockReturnValue('https://testLogOutURL.com');

    const config = {
      API_HOST: '',
      CHANGE_VERSION: '',
      NODE_ENV: '',
      VERSION: '',
      KEYCLOAK_CONFIG: {
        url: 'https://www.mylogoutworks.com/auth',
        realm: 'myrealm',
        clientId: ''
      },
      SITEMINDER_LOGOUT_URL: 'https://www.siteminderlogout.com'
    };

    const { getByText } = render(
      <ConfigContext.Provider value={config}>
        <Router history={history}>
          <LogOutPage />
        </Router>
      </ConfigContext.Provider>
    );

    expect(getByText('Logging out...')).toBeVisible();

    expect(window.location.replace).toHaveBeenCalledWith('https://testLogOutURL.com');
  });
});
