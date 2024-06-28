import FileUpload, { IReplaceHandler } from 'components/file-upload/FileUpload';
import { IFileHandler, UploadFileStatus } from 'components/file-upload/FileUploadItem';
import { AttachmentType, ProjectSurveyAttachmentValidExtensions } from 'constants/attachments';
import { useFormikContext } from 'formik';
import React from 'react';
import { IAnimalTelemetryDeviceFile } from './device';

export const TelemetryFileUpload: React.FC<{ attachmentType: AttachmentType; fileKey: string; typeKey: string}> = (
  props
) => {
  const { setFieldValue } = useFormikContext<{ formValues: IAnimalTelemetryDeviceFile[] }>();
  const fileHandler: IFileHandler = (file) => {
    setFieldValue(props.fileKey, file);
    setFieldValue(props.typeKey, props.attachmentType);
  };

  const replaceHandler: IReplaceHandler = () => {
    setFieldValue(props.fileKey, null);
    setFieldValue(props.typeKey, props.attachmentType);
  };

  return (
    <FileUpload
      fileHandler={fileHandler}
      onReplace={replaceHandler}
      dropZoneProps={{
        maxNumFiles: 1,
        multiple: false,
        acceptedFileExtensions:
          props.attachmentType === AttachmentType.KEYX
            ? ProjectSurveyAttachmentValidExtensions.KEYX
            : ProjectSurveyAttachmentValidExtensions.CONFIG
      }}
      hideDropZoneOnMaxFiles={true}
      replace={true}
      status={UploadFileStatus.STAGED}
    />
  );
};

export default TelemetryFileUpload;
