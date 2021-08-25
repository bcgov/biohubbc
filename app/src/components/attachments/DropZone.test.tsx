import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import DropZone from './DropZone';

const onFiles = jest.fn();

const renderContainer = () => {
  return render(<DropZone onFiles={onFiles} acceptedFileExtensions=".txt" />);
};

describe('DropZone', () => {
  it('matches the snapshot', () => {
    const { asFragment } = renderContainer();

    expect(asFragment()).toMatchSnapshot();
  });

  it('calls the `onFiles` callback when files are selected', async () => {
    const { getByTestId } = renderContainer();

    const testFile = new File(['test png content'], 'testpng.txt', { type: 'text/plain' });

    const dropZoneInput = getByTestId('drop-zone-input');

    fireEvent.change(dropZoneInput, { target: { files: [testFile] } });

    await waitFor(() => {
      expect(onFiles).toHaveBeenCalledWith([testFile], [], expect.any(Object));
    });
  });
});
