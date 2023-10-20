import Typography from '@mui/material/Typography';
import { ISubtextProps } from 'components/file-upload/FileUploadItem';

/**
 * Upload subtext field.
 *
 * Changes subtext on the state of the upload.
 *
 * @param {*} props
 * @return {*}
 */
const FileUploadItemSubtext = (props: ISubtextProps) => {
  return (
    <Typography variant="caption" component="span">
      {props.error || props.status}
    </Typography>
  );
};

export default FileUploadItemSubtext;
