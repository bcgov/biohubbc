import FileUpload, { IReplaceHandler } from 'components/file-upload/FileUpload';
import { IFileHandler, UploadFileStatus } from 'components/file-upload/FileUploadItem';
import { AttachmentType, ProjectSurveyAttachmentValidExtensions } from 'constants/attachments';
import { useFormikContext } from 'formik';
import React from 'react';
import { IAnimalTelemetryDeviceFile } from './TelemetryDeviceForm';

export const TelemetryFileUploadWithMeta: React.FC<{ attachmentType: AttachmentType; index: number }> = (props) => {
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
    <>
      {props.attachmentType === AttachmentType.KEYX && (
        <FileUpload
          fileHandler={fileHandler}
          onReplace={replaceHandler}
          dropZoneProps={{
            maxNumFiles: 1,
            multiple: false,
            acceptedFileExtensions: ProjectSurveyAttachmentValidExtensions.KEYX
          }}
          replace={true}
          status={UploadFileStatus.STAGED}
        />
      )}
      {props.attachmentType === AttachmentType.OTHER && (
        <FileUpload
          fileHandler={fileHandler}
          onReplace={replaceHandler}
          dropZoneProps={{
            maxNumFiles: 1,
            multiple: false,
            acceptedFileExtensions: ProjectSurveyAttachmentValidExtensions.CONFIG
          }}
          replace={true}
          status={UploadFileStatus.STAGED}
        />
      )}
    </>
  );
};

export default TelemetryFileUploadWithMeta;
