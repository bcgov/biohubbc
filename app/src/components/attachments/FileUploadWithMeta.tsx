import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { ProjectSurveyAttachmentValidExtensions } from 'constants/attachments';
import { useFormikContext } from 'formik';
import React from 'react';
import ReportMetaForm, { IReportMetaForm } from '../attachments/ReportMetaForm';
import FileUpload, { IReplaceHandler } from './FileUpload';
import { IFileHandler, IOnUploadSuccess, IUploadHandler, UploadFileStatus } from './FileUploadItem';

export interface IFileUploadWithMetaProps {
  attachmentType: 'Report' | 'Other';
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
      {props.attachmentType === 'Report' && (
        <Box mb={3}>
          <ReportMetaForm />
        </Box>
      )}
      {(props.attachmentType === 'Report' && (
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
              <Typography style={{ fontSize: '12px', color: '#f44336' }}>{errors.attachmentFile}</Typography>
            </Box>
          )}
        </Box>
      )) || <FileUpload uploadHandler={props.uploadHandler} onSuccess={props.onSuccess} replace={true} />}
    </form>
  );
};

export default FileUploadWithMeta;
