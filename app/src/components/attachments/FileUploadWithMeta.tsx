import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ReportMetaForm, { IReportMetaForm } from 'components/attachments/ReportMetaForm';
import { UploadFileStatus } from 'components/file-upload/FileUploadItem';
import { FileUploadSingleItem } from 'components/file-upload/FileUploadSingleItem';
import { AttachmentTypeFileExtensions } from 'constants/attachments';
import { useFormikContext } from 'formik';

/**
 * File upload with meta form. Used to upload a report with accompanying meta data.
 *
 * @return {*}
 */
export const FileUploadWithMeta = () => {
  const { handleSubmit, setFieldValue, setFieldError, values, errors } = useFormikContext<IReportMetaForm>();

  const onStatus = (status: UploadFileStatus) => {
    console.log(status);
  };

  const onFile = (file: File | null) => {
    setFieldValue('attachmentFile', file);
  };

  const onError = (error: string) => {
    setFieldError('attachmentFile', error);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box mb={3}>
        <ReportMetaForm />
      </Box>
      <Box component="fieldset">
        <Typography component="legend" variant="body1" id="report_upload">
          Attach File
        </Typography>
        <FileUploadSingleItem
          file={values.attachmentFile}
          onStatus={onStatus}
          onFile={onFile}
          onError={onError}
          DropZoneProps={{
            acceptedFileExtensions: AttachmentTypeFileExtensions.REPORT
          }}
          status={UploadFileStatus.STAGED}
        />
        {errors?.attachmentFile && (
          <Box>
            {/* TODO is errors.attachmentFile correct here? (added `as string` to appease compile warning) */}
            <Typography style={{ fontSize: '12px', color: '#f44336' }}>{errors.attachmentFile as string}</Typography>
          </Box>
        )}
      </Box>
    </form>
  );
};

export default FileUploadWithMeta;
