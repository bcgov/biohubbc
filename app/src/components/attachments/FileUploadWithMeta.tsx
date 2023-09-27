import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ReportMetaForm, { IReportMetaForm } from 'components/attachments/ReportMetaForm';
import FileUpload, { IReplaceHandler } from 'components/file-upload/FileUpload';
import {
  IFileHandler,
  IOnUploadSuccess,
  IUploadHandler,
  UploadFileStatus
} from 'components/file-upload/FileUploadItem';
import { AttachmentType, ProjectSurveyAttachmentValidExtensions } from 'constants/attachments';
import { useFormikContext } from 'formik';
import React from 'react';

export interface IFileUploadWithMetaProps {
  attachmentType: AttachmentType.REPORT | AttachmentType.KEYX | AttachmentType.OTHER;
  uploadHandler: IUploadHandler;
  fileHandler?: IFileHandler;
  onSuccess?: IOnUploadSuccess;
}

export const FileUploadWithMeta: React.FC<IFileUploadWithMetaProps> = (props) => {
  const { handleSubmit, setFieldValue, errors } = useFormikContext<IReportMetaForm>();

  const fileHandler: IFileHandler = (file) => {
    setFieldValue('attachmentFile', file);

    props.fileHandler?.(file);
  };

  const replaceHandler: IReplaceHandler = () => {
    setFieldValue('attachmentFile', null);
  };

  return (
    <form onSubmit={handleSubmit}>
      {props.attachmentType === AttachmentType.REPORT && (
        <Box mb={3}>
          <ReportMetaForm />
        </Box>
      )}
      {props.attachmentType === AttachmentType.REPORT && (
        <Box component="fieldset">
          <Typography component="legend" variant="body1" id="report_upload">
            Attach File
          </Typography>
          <FileUpload
            uploadHandler={props.uploadHandler}
            fileHandler={fileHandler}
            onReplace={replaceHandler}
            onSuccess={props.onSuccess}
            dropZoneProps={{
              maxNumFiles: 1,
              multiple: false,
              acceptedFileExtensions: ProjectSurveyAttachmentValidExtensions.REPORT
            }}
            status={UploadFileStatus.STAGED}
            replace={true}
          />
          {errors?.attachmentFile && (
            <Box>
              {/* TODO is errors.attachmentFile correct here? (added `as string` to appease compile warning) */}
              <Typography style={{ fontSize: '12px', color: '#f44336' }}>{errors.attachmentFile as string}</Typography>
            </Box>
          )}
        </Box>
      )}
      {props.attachmentType === AttachmentType.KEYX && (
        <FileUpload
          uploadHandler={props.uploadHandler}
          fileHandler={fileHandler}
          onSuccess={props.onSuccess}
          dropZoneProps={{
            acceptedFileExtensions: ProjectSurveyAttachmentValidExtensions.KEYX
          }}
          enableErrorDetails={true}
        />
      )}
      {props.attachmentType === AttachmentType.OTHER && (
        <FileUpload uploadHandler={props.uploadHandler} onSuccess={props.onSuccess} />
      )}
    </form>
  );
};

export default FileUploadWithMeta;
