import { AttachmentType } from 'constants/attachments';
import { Form, Formik } from 'formik';
import { createEvent, fireEvent, render } from 'test-helpers/test-utils';
import TelemetryFileUpload from './TelemetryFileUpload';
// import FileUpload from 'components/file-upload/FileUpload';

describe('TelemetryFileUpload', () => {
  let setFieldValue: any;
  let initialValues: [{ attachmentFile?: File; attachmentType?: AttachmentType }];
  const attachmentType = AttachmentType.KEYX;
  const index = 0;

  beforeEach(() => {
    setFieldValue = jest.fn();
    initialValues = [{}];
  });

  const renderComponentWithFormik = () => {
    return render(
      <Formik initialValues={{ formValues: initialValues }} onSubmit={() => {}}>
        {(formik) => (
          <Form>
            <TelemetryFileUpload attachmentType={attachmentType} index={index} />
          </Form>
        )}
      </Formik>
    );
  };

  // Mocking FileUpload component to directly call fileHandler
  const MockFileUpload: React.FC<{ fileHandler: any }> = ({ fileHandler }) => {
    return (
      <input
        data-testid="mock-file-upload"
        onChange={(e) => {
          return fileHandler(e?.target?.files?.[0]);
        }}
        type="file"
      />
    );
  };

  jest.mock('components/file-upload/FileUpload', () => {
    return {
      __esModule: true,
      default: (props: { fileHandler: any }) => <MockFileUpload {...props} />
    };
  });

  it('sets field value of attachmentFile and attachmentType when a file is uploaded', async () => {
    const { getByTestId } = renderComponentWithFormik();
    const mockFileInput = getByTestId('mock-file-upload');

    const file = new File(['test content'], 'test.txt');

    const uploadEvent = createEvent.change(mockFileInput, { target: { files: [file] } });
    fireEvent(mockFileInput, uploadEvent);

    expect(setFieldValue).toHaveBeenCalledWith(`formValues[${index}].attachmentFile`, file);
    expect(setFieldValue).toHaveBeenCalledWith(`formValues[${index}].attachmentType`, attachmentType);
  });
});
