import { IFileUploadWithMetaProps } from 'components/attachments/FileUploadWithMeta';
import { IReportMetaForm } from 'components/attachments/ReportMetaForm';
import FileUpload, { IReplaceHandler } from 'components/file-upload/FileUpload';
import { IFileHandler } from 'components/file-upload/FileUploadItem';
import { AttachmentType, ProjectSurveyAttachmentValidExtensions } from 'constants/attachments';
import { useFormikContext } from 'formik';
import React from 'react';

export const TelemetryFileUploadWithMeta: React.FC<IFileUploadWithMetaProps> = (props) => {
  const { handleSubmit, setFieldValue } = useFormikContext<IReportMetaForm>();

  const fileHandler: IFileHandler = (file) => {
    setFieldValue('attachmentFile', file);

    props.fileHandler?.(file);
  };

  const replaceHandler: IReplaceHandler = () => {
    setFieldValue('attachmentFile', null);
  };

  return (
    <form onSubmit={handleSubmit}>
      {props.attachmentType === AttachmentType.KEYX && (
        <FileUpload
          uploadHandler={props.uploadHandler}
          fileHandler={fileHandler}
          onReplace={replaceHandler}
          onSuccess={props.onSuccess}
          dropZoneProps={{
            maxNumFiles: 1,
            multiple: false,
            acceptedFileExtensions: ProjectSurveyAttachmentValidExtensions.KEYX
          }}
          replace={true}
          errorDetails={true}
        />
      )}
      {props.attachmentType === AttachmentType.OTHER && (
        <FileUpload
          uploadHandler={props.uploadHandler}
          onSuccess={props.onSuccess}
          dropZoneProps={{
            maxNumFiles: 1,
            multiple: false,
            acceptedFileExtensions: ProjectSurveyAttachmentValidExtensions.CONFIG
          }}
          replace={true}
        />
      )}
    </form>
  );
};

export default TelemetryFileUploadWithMeta;
