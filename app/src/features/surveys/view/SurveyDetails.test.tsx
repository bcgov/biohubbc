import { render } from '@testing-library/react';
import React from 'react';
import SurveyDetails from './SurveyDetails';

describe('SurveyDetails', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <SurveyDetails />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
