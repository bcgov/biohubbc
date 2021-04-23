import { render } from '@testing-library/react';
import React from 'react';
import AuthLayout from './AuthLayout';

describe('AuthLayout', () => {
  it('renders spinner when context is not ready', () => {
    const { asFragment } = render(
      <AuthLayout>
        <div>
          <p>The public layout content</p>
        </div>
      </AuthLayout>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
