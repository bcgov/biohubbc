import { render } from '@testing-library/react';
import React from 'react';
import RequestSubmitted from './RequestSubmitted';

describe('NotFoundPage', () => {
  it('renders correctly', () => {
    const { asFragment } = render(<RequestSubmitted />);

    expect(asFragment()).toMatchSnapshot();
  });
});
