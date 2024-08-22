import FileUpload, { IReplaceHandler } from 'components/file-upload/FileUpload';
import { IFileHandler, UploadFileStatus } from 'components/file-upload/FileUploadItem';
import { AttachmentType } from 'constants/attachments';
import { useFormikContext } from 'formik';
import { IAnimalTelemetryDeviceFile } from '../../../../../view/survey-animals/telemetry-device/device';

export interface IDeploymentDeviceKeyFieldProps {
  attachmentType: AttachmentType;
  attachmentTypeFileExtensions: string | string[];
  fileKey: string;
  typeKey: string;
}

export const DeploymentDeviceKeyField = (props: IDeploymentDeviceKeyFieldProps) => {
  const { attachmentType, attachmentTypeFileExtensions, fileKey, typeKey } = props;

  const { setFieldValue } = useFormikContext<{ formValues: IAnimalTelemetryDeviceFile[] }>();
  const fileHandler: IFileHandler = (file) => {
    setFieldValue(fileKey, file);
    setFieldValue(typeKey, attachmentType);
  };

  const replaceHandler: IReplaceHandler = () => {
    setFieldValue(fileKey, null);
    setFieldValue(typeKey, attachmentType);
  };

  return (
    <FileUpload
      fileHandler={fileHandler}
      onReplace={replaceHandler}
      replace={true}
      dropZoneProps={{
        maxNumFiles: 1,
        multiple: false,
        acceptedFileExtensions: attachmentTypeFileExtensions
      }}
      hideDropZoneOnMaxFiles={true}
      status={UploadFileStatus.STAGED}
    />
  );
};
