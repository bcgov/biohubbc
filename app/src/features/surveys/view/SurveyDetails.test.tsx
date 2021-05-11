import { render } from '@testing-library/react';
import React from 'react';
import SurveyDetails from './SurveyDetails';
import { getProjectSurveyForViewResponse } from 'test-helpers/survey-helpers';
import { codes } from 'test-helpers/code-helpers';

describe('SurveyDetails', () => {
  it('renders correctly', () => {
    const { asFragment } = render(<SurveyDetails surveyForViewData={getProjectSurveyForViewResponse} codes={codes} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
