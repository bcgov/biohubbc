import { render } from '@testing-library/react';
import React from 'react';
import SurveyObservations from './SurveyObservations';
import { MemoryRouter } from 'react-router';

describe('SurveyObservations', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <SurveyObservations />
      </MemoryRouter>
    );

    expect(getByTestId('observations-heading')).toBeInTheDocument();
  });
});
