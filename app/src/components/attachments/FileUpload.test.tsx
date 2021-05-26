import { fireEvent, render, waitFor } from '@testing-library/react';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import FileUpload from './FileUpload';

jest.mock('../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  project: {
    uploadProjectAttachments: jest.fn<Promise<any>, []>()
  },
  survey: {
    uploadSurveyAttachments: jest.fn<Promise<any>, []>()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

const projectId = 1;
const surveyId = 2;

const renderContainer = () => {
  return render(<FileUpload projectId={projectId} />);
};

describe('FileUpload', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().project.uploadProjectAttachments.mockClear();
    mockBiohubApi().survey.uploadSurveyAttachments.mockClear();
  });

  it('renders the dropZone component', async () => {
    const { getByText } = renderContainer();

    expect(getByText('Drag your files here', { exact: false })).toBeVisible();
  });

  it('renders an item in the list for each file added for project list', async () => {
    mockBiohubApi().project.uploadProjectAttachments.mockReturnValue(Promise.resolve());

    const { getByTestId, getByText } = renderContainer();

    const dropZoneInput = getByTestId('drop-zone-input');

    fireEvent.change(dropZoneInput, {
      target: {
        files: [
          new File([`test png content`], `testpng0.txt`, { type: 'text/plain' }),
          new File([`test png content`], `testpng1.txt`, { type: 'text/plain' }),
          new File([`test png content`], `testpng2.txt`, { type: 'text/plain' }),
          new File([`test png content`], `testpng3.txt`, { type: 'text/plain' }),
          new File([`test png content`], `testpng4.txt`, { type: 'text/plain' })
        ]
      }
    });

    await waitFor(() => {
      expect(getByText('testpng0.txt')).toBeVisible();
      expect(getByText('testpng1.txt')).toBeVisible();
      expect(getByText('testpng2.txt')).toBeVisible();
      expect(getByText('testpng3.txt')).toBeVisible();
      expect(getByText('testpng4.txt')).toBeVisible();
    });
  });

  it('renders an item in the list for each file added for survey list', async () => {
    mockBiohubApi().survey.uploadSurveyAttachments.mockReturnValue(Promise.resolve());

    const { getByTestId, getByText } = render(<FileUpload projectId={projectId} surveyId={surveyId} />);

    const dropZoneInput = getByTestId('drop-zone-input');

    fireEvent.change(dropZoneInput, {
      target: {
        files: [
          new File([`test png content`], `testpng0.txt`, { type: 'text/plain' }),
          new File([`test png content`], `testpng1.txt`, { type: 'text/plain' }),
          new File([`test png content`], `testpng2.txt`, { type: 'text/plain' }),
          new File([`test png content`], `testpng3.txt`, { type: 'text/plain' }),
          new File([`test png content`], `testpng4.txt`, { type: 'text/plain' })
        ]
      }
    });

    await waitFor(() => {
      expect(getByText('testpng0.txt')).toBeVisible();
      expect(getByText('testpng1.txt')).toBeVisible();
      expect(getByText('testpng2.txt')).toBeVisible();
      expect(getByText('testpng3.txt')).toBeVisible();
      expect(getByText('testpng4.txt')).toBeVisible();
    });
  });

  it('removes an item from the list when the onCancel callback is triggered', async () => {
    mockBiohubApi().project.uploadProjectAttachments.mockReturnValue(new Promise(() => {}));

    const { getByTestId, getByText, getByTitle, queryByText } = renderContainer();

    const dropZoneInput = getByTestId('drop-zone-input');

    fireEvent.change(dropZoneInput, {
      target: {
        files: [new File([`test png content`], `testpng0.txt`, { type: 'text/plain' })]
      }
    });

    await waitFor(() => {
      expect(getByText('testpng0.txt')).toBeVisible();
    });

    fireEvent.click(getByTitle('Cancel Upload'));

    await waitFor(() => {
      expect(queryByText('testpng0.txt')).not.toBeInTheDocument();
    });
  });
});
