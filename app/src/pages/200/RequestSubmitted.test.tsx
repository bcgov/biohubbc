import { fireEvent, render } from '@testing-library/react';
import { ConfigContext, IConfig } from 'contexts/configContext';
import React from 'react';
import RequestSubmitted from './RequestSubmitted';

describe('RequestSubmitted', () => {
  it('renders correctly', () => {
    const { asFragment } = render(<RequestSubmitted />);

    expect(asFragment()).toMatchSnapshot();
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

    it('should not logout when no config provided', () => {
      const target = 'https://example.com/';

      window.location.href = target;

      expect(window.location.href).toBe(target);

      const { getByText } = render(
        <ConfigContext.Provider value={(null as unknown) as IConfig}>
          <RequestSubmitted />
        </ConfigContext.Provider>
      );

      fireEvent.click(getByText('Logout'));

      expect(window.location.href).toBe(target);
    });

    it('should change the location.href appropriately on logout success', () => {
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
          <RequestSubmitted />
        </ConfigContext.Provider>
      );

      fireEvent.click(getByText('Logout'));

      expect(window.location.href).toEqual(
        'https://www.mylogoutworks.com/auth/realms/myrealm/protocol/openid-connect/logout?redirect_uri=' +
          encodeURI(window.location.origin) +
          '/access-request'
      );
    });
  });
});
