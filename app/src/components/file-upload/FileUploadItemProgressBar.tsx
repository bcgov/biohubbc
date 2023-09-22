import { Theme } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { makeStyles } from '@mui/styles';
import { IProgressBarProps, UploadFileStatus } from './FileUploadItem';

const useStyles = makeStyles((theme: Theme) => ({
  uploadProgress: {
    marginTop: theme.spacing(0.5)
  },
  uploadingColor: {
    color: theme.palette.primary.main
  },
  completeBgColor: {
    background: theme.palette.success.main
  },
  errorBgColor: {
    background: theme.palette.error.main + '44'
  }
}));

/**
 * Upload progress bar.
 *
 * Changes color and style depending on the status.
 *
 * @param {*} props
 * @return {*}
 */
const FileUploadItemProgressBar = (props: IProgressBarProps) => {
  const classes = useStyles();
  if (props.status === UploadFileStatus.STAGED) {
    return <></>;
  }

  if (props.status === UploadFileStatus.FINISHING_UPLOAD) {
    return (
      <LinearProgress
        variant="indeterminate"
        className={classes.uploadProgress}
        classes={{ colorPrimary: classes.uploadingColor, barColorPrimary: classes.uploadingColor }}
      />
    );
  }

  if (props.status === UploadFileStatus.COMPLETE) {
    return (
      <LinearProgress
        variant="determinate"
        value={100}
        className={classes.uploadProgress}
        classes={{ colorPrimary: classes.completeBgColor, barColorPrimary: classes.completeBgColor }}
      />
    );
  }

  if (props.status === UploadFileStatus.FAILED) {
    return (
      <LinearProgress
        variant="determinate"
        value={0}
        className={classes.uploadProgress}
        classes={{ colorPrimary: classes.errorBgColor, barColorPrimary: classes.errorBgColor }}
      />
    );
  }

  // status is PENDING or UPLOADING
  return (
    <LinearProgress
      variant="determinate"
      value={props.progress}
      className={classes.uploadProgress}
      classes={{ colorPrimary: classes.uploadingColor, barColorPrimary: classes.uploadingColor }}
    />
  );
};

export default FileUploadItemProgressBar;
