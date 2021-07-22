import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import TemplateObservationList from './TemplateObservationList';

jest.mock('../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  survey: {
    getTemplateObservationsSignedURL: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('TemplateObservationList', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().survey.getTemplateObservationsSignedURL.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  const templateObservationsList = [
    {
      id: 1,
      fileName: 'filename.test',
      lastModified: '2021-04-09 11:53:53',
      size: 3028
    },
    {
      id: 20,
      fileName: 'filename20.test',
      lastModified: '2021-04-09 11:53:53',
      size: 30280000
    },
    {
      id: 30,
      fileName: 'filename30.test',
      lastModified: '2021-04-09 11:53:53',
      size: 30280000000
    }
  ];

  it('renders correctly with no template observations', () => {
    const { getByText } = render(
      <TemplateObservationList projectId={1} templateObservationsList={[]} getTemplateObservations={jest.fn()} />
    );

    expect(getByText('No Template Observations')).toBeInTheDocument();
  });

  it('renders correctly with template observations (of various sizes)', async () => {
    const { getByText } = render(
      <TemplateObservationList
        projectId={1}
        templateObservationsList={templateObservationsList}
        getTemplateObservations={jest.fn()}
      />
    );

    expect(getByText('filename.test')).toBeInTheDocument();
    expect(getByText('filename20.test')).toBeInTheDocument();
    expect(getByText('filename30.test')).toBeInTheDocument();
  });

  it('viewing file contents in new tab works as expected for template observations', async () => {
    window.open = jest.fn();

    const signedUrl = 'www.signedurl.com';

    mockBiohubApi().survey.getTemplateObservationsSignedURL.mockResolvedValue(signedUrl);

    const { getByText } = render(
      <TemplateObservationList
        projectId={1}
        surveyId={32}
        templateObservationsList={templateObservationsList}
        getTemplateObservations={jest.fn()}
      />
    );

    expect(getByText('filename.test')).toBeInTheDocument();

    fireEvent.click(getByText('filename.test'));

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(signedUrl);
    });
  });

  it('changing pages displays the correct rows as expected', () => {
    const largeList = [
      { ...templateObservationsList[0] },
      {
        ...templateObservationsList[0],
        id: 2,
        fileName: 'filename2.test'
      },
      {
        ...templateObservationsList[0],
        id: 3,
        fileName: 'filename3.test'
      },
      {
        ...templateObservationsList[0],
        id: 4,
        fileName: 'filename4.test'
      },
      {
        ...templateObservationsList[0],
        id: 5,
        fileName: 'filename5.test'
      },
      {
        ...templateObservationsList[0],
        id: 6,
        fileName: 'filename6.test'
      },
      {
        ...templateObservationsList[0],
        id: 7,
        fileName: 'filename7.test'
      },
      {
        ...templateObservationsList[0],
        id: 8,
        fileName: 'filename8.test'
      },
      {
        ...templateObservationsList[0],
        id: 9,
        fileName: 'filename9.test'
      },
      {
        ...templateObservationsList[0],
        id: 10,
        fileName: 'filename10.test'
      },
      {
        ...templateObservationsList[0],
        id: 11,
        fileName: 'filename11.test'
      }
    ];

    const { getByText, queryByText, getByLabelText } = render(
      <TemplateObservationList projectId={1} templateObservationsList={largeList} getTemplateObservations={jest.fn()} />
    );

    expect(getByText('filename.test')).toBeInTheDocument();
    expect(getByText('filename2.test')).toBeInTheDocument();
    expect(getByText('filename3.test')).toBeInTheDocument();
    expect(getByText('filename4.test')).toBeInTheDocument();
    expect(getByText('filename5.test')).toBeInTheDocument();
    expect(getByText('filename6.test')).toBeInTheDocument();
    expect(getByText('filename7.test')).toBeInTheDocument();
    expect(getByText('filename8.test')).toBeInTheDocument();
    expect(getByText('filename9.test')).toBeInTheDocument();
    expect(getByText('filename10.test')).toBeInTheDocument();
    expect(queryByText('filename11.test')).toBeNull();

    fireEvent.click(getByLabelText('Next page'));

    expect(getByText('filename11.test')).toBeInTheDocument();
    expect(queryByText('filename10.test')).toBeNull();
  });
});
