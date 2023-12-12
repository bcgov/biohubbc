import { AttachmentType } from 'constants/attachments';
import { Formik } from 'formik';
import { render } from 'test-helpers/test-utils';
import TelemetryFileUpload from './TelemetryFileUpload';

describe('TelemetryFileUpload component', () => {
  it('should render with correct props', async () => {
    const { getByTestId } = render(
      <Formik initialValues={{ formValues: [] }} onSubmit={jest.fn()}>
        <TelemetryFileUpload attachmentType={AttachmentType.KEYX} typeKey="key" fileKey="key" />
      </Formik>
    );

    const fileUploadComponent = getByTestId('drop-zone-input');
    expect(fileUploadComponent).toBeInTheDocument();
  });
});
