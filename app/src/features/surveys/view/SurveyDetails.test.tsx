import { render } from '@testing-library/react';
import React from 'react';
import SurveyDetails from './SurveyDetails';
import { getSurveyForViewResponse } from 'test-helpers/survey-helpers';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';

describe('SurveyDetails', () => {
  const mockRefresh = jest.fn();

  it('renders correctly', () => {
    const { asFragment } = render(
      <SurveyDetails
        surveyForViewData={getSurveyForViewResponse}
        codes={codes}
        projectForViewData={getProjectForViewResponse}
        refresh={mockRefresh}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
