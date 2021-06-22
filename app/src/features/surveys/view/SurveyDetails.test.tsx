import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import SurveyDetails from './SurveyDetails';
import { getSurveyForViewResponse } from 'test-helpers/survey-helpers';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { DialogContextProvider } from 'contexts/dialogContext';
import { useBiohubApi } from 'hooks/useBioHubApi';

const history = createMemoryHistory();

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  survey: {
    deleteSurvey: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('SurveyDetails', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().survey.deleteSurvey.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  const mockRefresh = jest.fn();

  const component = (
    <DialogContextProvider>
      <Router history={history}>
        <SurveyDetails
          surveyForViewData={getSurveyForViewResponse}
          codes={codes}
          projectForViewData={getProjectForViewResponse}
          refresh={mockRefresh}
        />
      </Router>
    </DialogContextProvider>
  );

  it('renders correctly', () => {
    const { asFragment } = render(component);

    expect(asFragment()).toMatchSnapshot();
  });

  it('delete survey works and takes user to the surveys list page', async () => {
    mockBiohubApi().survey.deleteSurvey.mockResolvedValue(true);

    const { getByTestId, getByText } = render(component);

    fireEvent.click(getByTestId('delete-survey-button'));

    await waitFor(() => {
      expect(
        getByText('Are you sure you want to delete this survey, its attachments and associated observations?')
      ).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('yes-button'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual(`/projects/${getProjectForViewResponse.id}/surveys`);
    });
  });
});
