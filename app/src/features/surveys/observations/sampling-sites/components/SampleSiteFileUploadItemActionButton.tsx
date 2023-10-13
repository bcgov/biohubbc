import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import IconButton from '@mui/material/IconButton';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { IActionButtonProps, UploadFileStatus } from 'components/file-upload/FileUploadItem';

const useStyles = makeStyles((theme: Theme) => ({
  errorColor: {
    color: theme.palette.error.main
  }
}));

/**
 * Upload action button.
 *
 * Changes color and icon depending on the status.
 *
 * @param {*} props
 * @return {*}
 */
const SampleSiteFileUploadItemActionButton = (props: IActionButtonProps) => {
  const classes = useStyles();

  if (props.status === UploadFileStatus.PENDING || props.status === UploadFileStatus.STAGED) {
    return (
      <IconButton title="Remove File" aria-label="remove file" onClick={() => props.onCancel()}>
        <Icon path={mdiTrashCanOutline} size={1} />
      </IconButton>
    );
  }

  if (props.status === UploadFileStatus.UPLOADING) {
    return (
      <IconButton title="Cancel Upload" aria-label="cancel upload" onClick={() => props.onCancel()}>
        <Icon path={mdiTrashCanOutline} size={1} />
      </IconButton>
    );
  }

  if (props.status === UploadFileStatus.COMPLETE) {
    return (
      <IconButton title="Remove File" aria-label="remove file" onClick={() => props.onCancel()}>
        <Icon path={mdiTrashCanOutline} size={1} />
      </IconButton>
    );
  }

  if (props.status === UploadFileStatus.FAILED) {
    return (
      <IconButton
        title="Remove File"
        aria-label="remove file"
        onClick={() => props.onCancel()}
        className={classes.errorColor}>
        <Icon path={mdiTrashCanOutline} size={1} />
      </IconButton>
    );
  }

  // status is FINISHING_UPLOAD, show no action button
  return <></>;
};

export default SampleSiteFileUploadItemActionButton;
