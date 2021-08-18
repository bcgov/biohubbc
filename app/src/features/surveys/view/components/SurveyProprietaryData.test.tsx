import { render } from '@testing-library/react';
import { getSurveyForViewResponse } from 'test-helpers/survey-helpers';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import SurveyProprietaryData from './SurveyProprietaryData';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';

const mockRefresh = jest.fn();

const renderContainer = () => {
  return render(
    <SurveyProprietaryData
      projectForViewData={getProjectForViewResponse}
      surveyForViewData={getSurveyForViewResponse}
      codes={codes}
      refresh={mockRefresh}
    />
  );
};

describe('SurveyProprietaryData', () => {
  it('renders correctly', () => {
    const { asFragment } = renderContainer();

    expect(asFragment()).toMatchSnapshot();
  });
});
