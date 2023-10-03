import FileUpload, { IReplaceHandler } from 'components/file-upload/FileUpload';
import { IFileHandler, UploadFileStatus } from 'components/file-upload/FileUploadItem';
import { AttachmentType, ProjectSurveyAttachmentValidExtensions } from 'constants/attachments';
import { useFormikContext } from 'formik';
import React from 'react';
import { IAnimalTelemetryDeviceFile } from './TelemetryDeviceForm';

export const TelemetryFileUpload: React.FC<{ attachmentType: AttachmentType; index: number }> = (props) => {
  const { setFieldValue } = useFormikContext<{ formValues: IAnimalTelemetryDeviceFile[] }>();
  const fileHandler: IFileHandler = (file) => {
    setFieldValue(`${props.index}.attachmentFile`, file);
    setFieldValue(`${props.index}.attachmentType`, props.attachmentType);
  };

  const replaceHandler: IReplaceHandler = () => {
    setFieldValue(`${props.index}.attachmentFile`, null);
    setFieldValue(`${props.index}.attachmentType`, props.attachmentType);
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
