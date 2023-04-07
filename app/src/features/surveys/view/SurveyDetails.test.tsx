import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import SurveyDetails from './SurveyDetails';

describe.skip('SurveyDetails', () => {
  const component = <SurveyDetails codes={codes} />;

  jest.spyOn(console, 'debug').mockImplementation(() => {});

  it('renders correctly', async () => {
    const { asFragment } = render(component);

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
