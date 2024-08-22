import { AttachmentType, AttachmentTypeFileExtensions } from 'constants/attachments';
import { ConfigContext, IConfig } from 'contexts/configContext';
import { DeploymentDeviceKeyField } from 'features/surveys/telemetry/deployments/components/form/device-details/DeploymentDeviceKeyField';
import { Formik } from 'formik';
import { render } from 'test-helpers/test-utils';

describe('DeploymentDeviceKeyField component', () => {
  it('should render with correct props', async () => {
    const { getByTestId } = render(
      <ConfigContext.Provider value={{} as IConfig}>
        <Formik initialValues={{ formValues: [] }} onSubmit={jest.fn()}>
          <DeploymentDeviceKeyField
            attachmentType={AttachmentType.KEYX}
            attachmentTypeFileExtensions={AttachmentTypeFileExtensions.KEYX}
            typeKey="key"
            fileKey="key"
          />
        </Formik>
      </ConfigContext.Provider>
    );

    const fileUploadComponent = getByTestId('drop-zone-input');
    expect(fileUploadComponent).toBeInTheDocument();
  });
});
