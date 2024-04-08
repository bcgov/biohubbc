import { mdiCheck, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import useTheme from '@mui/material/styles/useTheme';
import { IActionButtonProps, UploadFileStatus } from './FileUploadItem';

const useStyles = () => {
  const theme = useTheme();

  return {
    completeColor: {
      color: theme.palette.success.main
    },
    errorColor: {
      color: theme.palette.error.main
    }
  };
};

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
        <Icon path={mdiCheck} size={1} style={classes.completeColor} />
      </Box>
    );
  }

  if (props.status === UploadFileStatus.FAILED) {
    return (
      <IconButton title="Remove File" aria-label="remove file" onClick={() => props.onCancel()} sx={classes.errorColor}>
        <Icon path={mdiTrashCanOutline} size={1} />
      </IconButton>
    );
  }

  // status is FINISHING_UPLOAD, show no action button
  return <></>;
};

export default FileUploadItemActionButton;
