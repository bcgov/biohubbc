import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
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
      <Box>
        {props.attachmentType === 'Report' && <ReportMetaForm />}
        <Box mt={3}>
          <Box component="fieldset">
            <Typography component="legend" variant="body1" id="report_details">
              Attach File
            </Typography>
            {(props.attachmentType === 'Report' && (
              <FileUpload
                uploadHandler={props.uploadHandler}
                fileHandler={fileHandler}
                onSuccess={props.onSuccess}
                dropZoneProps={{ maxNumFiles: 1 }}
                status={UploadFileStatus.STAGED}
              />
            )) || <FileUpload uploadHandler={props.uploadHandler} onSuccess={props.onSuccess} />}
          </Box>
        </Box>
      </Box>
    </form>
  );
};

export default FileUploadWithMeta;
