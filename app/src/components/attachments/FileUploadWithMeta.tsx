import Grid from '@material-ui/core/Grid';
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
      <Grid container spacing={2}>
        {props.attachmentType === 'Report' && (
          <Grid item xs={12}>
            <ReportMetaForm />
          </Grid>
        )}

        <Grid item xs={12}>
          <FileUpload uploadHandler={props.uploadHandler} onSuccess={onSuccess} />
        </Grid>
      </Grid>
    </form>
  );
};

export default FileUploadWithMeta;
