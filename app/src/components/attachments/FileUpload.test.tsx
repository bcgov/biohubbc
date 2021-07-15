import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import FileUpload, { IFileUploadProps } from './FileUpload';

const renderContainer = (props: IFileUploadProps) => {
  return render(<FileUpload {...props} />);
};

describe('FileUpload', () => {
  it('renders the dropZone component', async () => {
    const mockUploadHandler = jest.fn();

    const { getByText } = renderContainer({ uploadHandler: mockUploadHandler });

    expect(getByText('Drag your files here', { exact: false })).toBeVisible();
  });

  it('renders an item in the list for each file added for survey list', async () => {
    const mockUploadHandler = jest.fn().mockResolvedValue(null);

    const { getByTestId, getByText } = renderContainer({ uploadHandler: mockUploadHandler });

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
    const mockUploadHandler = jest.fn().mockResolvedValue(new Promise(() => {})); // return promise that doesn't resolve, giving time for the cancel button to be clicked

    const { getByTestId, getByText, getByTitle, queryByText } = renderContainer({ uploadHandler: mockUploadHandler });

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
