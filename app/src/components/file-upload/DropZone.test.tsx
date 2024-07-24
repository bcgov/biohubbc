import { ConfigContext, IConfig } from 'contexts/configContext';
import { fireEvent, render, waitFor } from 'test-helpers/test-utils';
import DropZone from './DropZone';

const onFiles = jest.fn();

const renderContainer = () => {
  return render(
    <ConfigContext.Provider value={{ MAX_UPLOAD_NUM_FILES: 10, MAX_UPLOAD_FILE_SIZE: 52428800 } as IConfig}>
      <DropZone onFiles={onFiles} acceptedFileExtensions=".txt" />
    </ConfigContext.Provider>
  );
};

describe('DropZone', () => {
  it('renders default instruction text', () => {
    const { getByTestId } = renderContainer();

    expect(getByTestId('dropzone-instruction-text').textContent).toEqual('Drag your files here, or Browse Files');
  });

  it('renders default maximum file size text', () => {
    const { getByTestId } = renderContainer();

    expect(getByTestId('dropzone-max-size-text').textContent).toEqual('Maximum size: 50 MB');
  });

  it('renders default maximum file count text', () => {
    const { getByTestId } = renderContainer();

    expect(getByTestId('dropzone-max-files-text').textContent).toEqual('Maximum files: 10');
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
