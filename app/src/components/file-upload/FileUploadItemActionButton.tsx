import { mdiCheck, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { makeStyles } from '@mui/styles';
import { IActionButtonProps, UploadFileStatus } from './FileUploadItem';

const useStyles = makeStyles((theme: Theme) => ({
  completeColor: {
    color: theme.palette.success.main
  },
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
const FileUploadItemActionButton = (props: IActionButtonProps) => {
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
      <Box display="flex" alignItems="center" p={'12px'}>
        <Icon path={mdiCheck} size={1} className={classes.completeColor} />
      </Box>
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
  return <Box width="4rem" />;
};

export default FileUploadItemActionButton;
