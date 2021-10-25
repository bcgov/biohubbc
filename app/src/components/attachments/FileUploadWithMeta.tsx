import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { useFormikContext } from 'formik';
import React from 'react';
import ReportMetaForm, { IReportMetaForm } from '../attachments/ReportMetaForm';
import FileUpload from './FileUpload';
import { IOnUploadSuccess, IUploadHandler } from './FileUploadItem';

export interface IFileUploadWithMetaProps {
  attachmentType: 'Report' | 'Other';
  uploadHandler: IUploadHandler;
  onSuccess: IOnUploadSuccess;
}

export const FileUploadWithMeta: React.FC<IFileUploadWithMetaProps> = (props) => {
  const { handleSubmit, setFieldValue } = useFormikContext<IReportMetaForm>();

  const onSuccess: IOnUploadSuccess = (response: any) => {
    console.log(response);
    if (!response) {
    }

    if (response.attachmentId) {
      setFieldValue('attachmentId', response.attachmentId);
    }

    props.onSuccess(response);
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
            <FileUpload uploadHandler={props.uploadHandler} onSuccess={onSuccess} />
          </Box>
        </Box>
      </Box>
    </form>
  );
};

export default FileUploadWithMeta;
