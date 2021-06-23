import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import ProjectDetails from './ProjectDetails';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { DialogContextProvider } from 'contexts/dialogContext';
import { useBiohubApi } from 'hooks/useBioHubApi';

const history = createMemoryHistory();

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  project: {
    deleteProject: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('ProjectDetails', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().project.deleteProject.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  getProjectForViewResponse.location.geometry.push({
    id: 'myGeo',
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [125.6, 10.1]
    },
    properties: {
      name: 'Dinagat Islands'
    }
  });

  const component = (
    <DialogContextProvider>
      <Router history={history}>
        <ProjectDetails projectForViewData={getProjectForViewResponse} codes={codes} refresh={jest.fn()} />
      </Router>
    </DialogContextProvider>
  );

  it('renders correctly', () => {
    const { asFragment } = render(component);

    expect(asFragment()).toMatchSnapshot();
  });

  it('delete project works and takes user to the projects list page', async () => {
    mockBiohubApi().project.deleteProject.mockResolvedValue(true);

    const { getByTestId, getByText } = render(component);

    fireEvent.click(getByTestId('delete-project-button'));

    await waitFor(() => {
      expect(
        getByText('Are you sure you want to delete this project, its attachments and associated surveys/observations?')
      ).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('yes-button'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual(`/projects`);
    });
  });
});
