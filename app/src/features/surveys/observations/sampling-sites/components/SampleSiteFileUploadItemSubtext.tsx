import Typography from '@mui/material/Typography';
import { ISubtextProps, UploadFileStatus } from 'components/file-upload/FileUploadItem';
import { getFormattedFileSize } from 'utils/Utils';

/**
 * Upload subtext field.
 *
 * Changes subtext on the state of the upload.
 *
 * @param {*} props
 * @return {*}
 */
const SampleSiteFileUploadItemSubtext = (props: ISubtextProps) => {
  let subtext = props.error ?? props.status;

  if (props.status === UploadFileStatus.COMPLETE) {
    subtext = getFormattedFileSize(props.file.size);
  }

  return (
    <Typography variant="caption" component="span">
      {subtext}
    </Typography>
  );
};

export default SampleSiteFileUploadItemSubtext;
