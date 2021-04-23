import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { ConfigContext, IConfig } from 'contexts/configContext';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import { Router } from 'react-router';
import AccessRequestPage from './AccessRequestPage';

const history = createMemoryHistory();

jest.mock('../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  codes: {
    getAllCodeSets: jest.fn<Promise<object>, []>()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('AccessRequestPage', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().codes.getAllCodeSets.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly', async () => {
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      system_roles: [{ id: 1, name: 'Role 1' }],
      regional_offices: [{ id: 1, name: 'Office 1' }]
    });

    const { asFragment } = render(
      <Router history={history}>
        <AccessRequestPage />
      </Router>
    );

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('Logout', () => {
    const { location } = window;

    beforeAll(() => {
      // @ts-ignore
      delete window.location;

      // @ts-ignore
      window.location = {
        href: '',
        origin: ''
      };
    });

    afterAll(() => {
      window.location = location;
    });

    it('should not logout when no config provided', async () => {
      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
        system_roles: [{ id: 1, name: 'Role 1' }],
        regional_offices: [{ id: 1, name: 'Office 1' }]
      });

      const target = 'https://example.com/';

      window.location.href = target;

      expect(window.location.href).toBe(target);

      const { getByText } = render(
        <ConfigContext.Provider value={(null as unknown) as IConfig}>
          <Router history={history}>
            <AccessRequestPage />
          </Router>
        </ConfigContext.Provider>
      );

      fireEvent.click(getByText('Log out'));

      await waitFor(() => {
        expect(window.location.href).toBe(target);
      });
    });

    it('should change the location.href appropriately on logout success', async () => {
      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
        system_roles: [{ id: 1, name: 'Role 1' }],
        regional_offices: [{ id: 1, name: 'Office 1' }]
      });

      const target = 'https://example.com/';
      const config = {
        API_HOST: '',
        CHANGE_VERSION: '',
        NODE_ENV: '',
        VERSION: '',
        KEYCLOAK_CONFIG: {
          url: 'https://www.mylogoutworks.com/auth',
          realm: 'myrealm',
          clientId: ''
        }
      };

      window.location.href = target;

      expect(window.location.href).toBe(target);

      const { getByText } = render(
        <ConfigContext.Provider value={config}>
          <Router history={history}>
            <AccessRequestPage />
          </Router>
        </ConfigContext.Provider>
      );

      fireEvent.click(getByText('Log out'));

      await waitFor(() => {
        expect(window.location.href).toEqual(
          'https://www.mylogoutworks.com/auth/realms/myrealm/protocol/openid-connect/logout?redirect_uri=' +
            encodeURI(window.location.origin) +
            '/access-request'
        );
      });
    });
  });
});
