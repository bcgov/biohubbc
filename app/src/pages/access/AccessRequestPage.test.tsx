import { fireEvent, render, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import AccessRequestPage from './AccessRequestPage';

const history = createMemoryHistory();

describe('AccessRequestPage', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <Router history={history}>
        <AccessRequestPage />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  describe('Logout functionality', (): void => {
    const { location } = window;

    beforeAll((): void => {
      // @ts-ignore
      delete window.location;

      // @ts-ignore
      window.location = {
        href: ''
      };
    });

    afterAll((): void => {
      window.location = location;
    });

    it('should change the location.href appropriately on logout success', async () => {
      const target = 'https://example.com/';

      window.location.href = target;

      expect(window.location.href).toBe(target);

      const { getByText } = render(
        <Router history={history}>
          <AccessRequestPage />
        </Router>
      );

      fireEvent.click(getByText('Log out'));

      await waitFor(() => {
        expect(window.location.href).toEqual(
          'https://dev.oidc.gov.bc.ca/auth/realms/35r1iman/protocol/openid-connect/logout?redirect_uri=' +
            encodeURI(window.location.origin) +
            '%2Faccess-request'
        );
      });
    });
  });
});
