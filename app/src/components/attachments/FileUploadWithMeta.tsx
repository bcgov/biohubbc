import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { ProjectSurveyAttachmentValidExtensions } from 'constants/attachments';
import { useFormikContext } from 'formik';
import React from 'react';
import ReportMetaForm, { IReportMetaForm } from '../attachments/ReportMetaForm';
import FileUpload from './FileUpload';
import { IFileHandler, IOnUploadSuccess, IUploadHandler, UploadFileStatus } from './FileUploadItem';

export interface IFileUploadWithMetaProps {
  attachmentType: 'Report' | 'Other';
  uploadHandler: IUploadHandler;
  fileHandler?: IFileHandler;
  onSuccess?: IOnUploadSuccess;
}

export const FileUploadWithMeta: React.FC<IFileUploadWithMetaProps> = (props) => {
  const { handleSubmit, setFieldValue } = useFormikContext<IReportMetaForm>();

  const fileHandler: IFileHandler = (file: File) => {
    setFieldValue('attachmentFile', file);

    props.fileHandler?.(file);
  };

  return (
    <form onSubmit={handleSubmit}>
      {props.attachmentType === 'Report' && (
        <Box mb={3}>
          <ReportMetaForm />
        </Box>
      )}
      {(props.attachmentType === 'Report' && (
        <Box component="fieldset">
          <Typography component="legend" variant="body1" id="report_details">
            Attach File
          </Typography>
          <FileUpload
            uploadHandler={props.uploadHandler}
            fileHandler={fileHandler}
            onSuccess={props.onSuccess}
            dropZoneProps={{ maxNumFiles: 1, acceptedFileExtensions: ProjectSurveyAttachmentValidExtensions.REPORT }}
            status={UploadFileStatus.STAGED}
          />
        </Box>
      )) || <FileUpload uploadHandler={props.uploadHandler} onSuccess={props.onSuccess} />}
    </form>
  );
};

export default FileUploadWithMeta;
