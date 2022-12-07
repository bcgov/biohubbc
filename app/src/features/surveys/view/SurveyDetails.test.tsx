import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { getSurveyForViewResponse } from 'test-helpers/survey-helpers';
import SurveyDetails from './SurveyDetails';

describe.skip('SurveyDetails', () => {
  const mockRefresh = jest.fn();

  const component = (
    <SurveyDetails
      surveyForViewData={getSurveyForViewResponse}
      codes={codes}
      projectForViewData={getProjectForViewResponse}
      refresh={mockRefresh}
    />
  );

  jest.spyOn(console, 'debug').mockImplementation(() => {});

  it('renders correctly', async () => {
    const { asFragment } = render(component);

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
