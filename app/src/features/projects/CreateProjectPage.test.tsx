import { cleanup, findByText as rawFindByText, fireEvent, render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { ICreateProjectResponse } from 'interfaces/useBioHubApi-interfaces';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Router } from 'react-router';
import CreateProjectPage from './CreateProjectPage';

const history = createMemoryHistory();

jest.mock('../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  createProject: jest.fn<Promise<ICreateProjectResponse>, []>(),
  getAllCodes: jest.fn<Promise<object>, []>()
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

const renderContainer = () => {
  return render(
    <Router history={history}>
      <CreateProjectPage />,
    </Router>
  );
};

describe('CreateProjectPage', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().createProject.mockClear();
    mockBiohubApi().getAllCodes.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows the page title', async () => {
    await act(async () => {
      mockBiohubApi().createProject.mockResolvedValue({
        id: 100
      });
      mockBiohubApi().getAllCodes.mockResolvedValue({
        code_set: []
      });
      const { findByText } = renderContainer();
      const PageTitle = await findByText('Create Project');

      expect(PageTitle).toBeVisible();
    });
  });

  it('shows the incomplete form warning messages', async () => {
    await act(async () => {
      mockBiohubApi().createProject.mockResolvedValue({
        id: 100
      });
      mockBiohubApi().getAllCodes.mockResolvedValue({
        code_set: []
      });
      const { findByText } = renderContainer();
      const IncompletFormMessage1 = await findByText('The form is incomplete');
      const IncompletFormMessage2 = await findByText('Fields that need further action are highlighted below');

      expect(IncompletFormMessage1).toBeVisible();
      expect(IncompletFormMessage2).toBeVisible();
    });
  });

  describe('Are you sure? Dialog', () => {
    it('shows warning dialog if the user clicks the `Back to Projects` button', async () => {
      await act(async () => {
        mockBiohubApi().createProject.mockResolvedValue({
          id: 100
        });
        mockBiohubApi().getAllCodes.mockResolvedValue({
          code_set: []
        });
        history.push('/home');
        history.push('/projects/create');
        const { findByText, getByRole } = renderContainer();
        const BackToProjectsButton = await findByText('back to projects', { exact: false });

        fireEvent.click(BackToProjectsButton);
        const AreYouSureTitle = await findByText('Cancel Create Project');
        const AreYouSureText = await findByText('Are you sure you want to cancel?');
        const AreYouSureYesButton = await rawFindByText(getByRole('dialog'), 'Yes', { exact: false });

        expect(AreYouSureTitle).toBeVisible();
        expect(AreYouSureText).toBeVisible();
        expect(AreYouSureYesButton).toBeVisible();
      });
    });

    it('it calls history.goBack() if the user clicks `Yes`', async () => {
      await act(async () => {
        mockBiohubApi().createProject.mockResolvedValue({
          id: 100
        });
        mockBiohubApi().getAllCodes.mockResolvedValue({
          code_set: []
        });
        history.push('/home');
        history.push('/projects/create');
        const { findByText, getByRole } = renderContainer();
        const BackToProjectsButton = await findByText('back to projects', { exact: false });

        fireEvent.click(BackToProjectsButton);
        const AreYouSureYesButton = await rawFindByText(getByRole('dialog'), 'Yes', { exact: false });

        expect(history.location.pathname).toEqual('/projects/create');
        fireEvent.click(AreYouSureYesButton);
        expect(history.location.pathname).toEqual('/home');
      });
    });

    it('it does nothing if the user clicks `No`', async () => {
      await act(async () => {
        mockBiohubApi().createProject.mockResolvedValue({
          id: 100
        });
        mockBiohubApi().getAllCodes.mockResolvedValue({
          code_set: []
        });
        history.push('/home');
        history.push('/projects/create');
        const { findByText, getByRole } = renderContainer();
        const BackToProjectsButton = await findByText('back to projects', { exact: false });

        fireEvent.click(BackToProjectsButton);
        const AreYouSureNoButton = await rawFindByText(getByRole('dialog'), 'No', { exact: false });

        expect(history.location.pathname).toEqual('/projects/create');
        fireEvent.click(AreYouSureNoButton);
        expect(history.location.pathname).toEqual('/projects/create');
      });
    });
  });
});
