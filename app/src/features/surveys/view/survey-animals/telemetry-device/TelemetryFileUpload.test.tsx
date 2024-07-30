import { AttachmentType } from 'constants/attachments';
import { ConfigContext, IConfig } from 'contexts/configContext';
import { Formik } from 'formik';
import { render } from 'test-helpers/test-utils';
import TelemetryFileUpload from './TelemetryFileUpload';

describe('TelemetryFileUpload component', () => {
  it('should render with correct props', async () => {
    const { getByTestId } = render(
      <ConfigContext.Provider value={{} as IConfig}>
        <Formik initialValues={{ formValues: [] }} onSubmit={vi.fn()}>
          <TelemetryFileUpload attachmentType={AttachmentType.KEYX} typeKey="key" fileKey="key" />
        </Formik>
      </ConfigContext.Provider>
    );

    const fileUploadComponent = getByTestId('drop-zone-input');
    expect(fileUploadComponent).toBeInTheDocument();
  });
});
