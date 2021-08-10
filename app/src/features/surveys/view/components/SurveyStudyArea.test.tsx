import { render, waitFor } from '@testing-library/react';
import { getSurveyForViewResponse } from 'test-helpers/survey-helpers';
import React from 'react';
import SurveyStudyArea from './SurveyStudyArea';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';

const mockRefresh = jest.fn();

const renderContainer = () => {
  return render(
    <SurveyStudyArea
      projectForViewData={getProjectForViewResponse}
      surveyForViewData={getSurveyForViewResponse}
      refresh={mockRefresh}
    />
  );
};

jest.spyOn(console, 'debug').mockImplementation(() => {});

describe('SurveyStudyArea', () => {
  it('renders correctly', async () => {
    const { asFragment } = renderContainer();

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
