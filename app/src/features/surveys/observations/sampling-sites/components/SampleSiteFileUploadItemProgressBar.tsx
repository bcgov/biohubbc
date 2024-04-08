import LinearProgress from '@mui/material/LinearProgress';
import useTheme from '@mui/material/styles/useTheme';
import { IProgressBarProps, UploadFileStatus } from 'components/file-upload/FileUploadItem';

const useStyles = () => {
  const theme = useTheme();

  return {
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
  };
};

/**
 * Upload progress bar.
 *
 * Changes color and style depending on the status.
 *
 * @param {*} props
 * @return {*}
 */
const SampleSiteFileUploadItemProgressBar = (props: IProgressBarProps) => {
  const classes = useStyles();
  if (props.status === UploadFileStatus.STAGED) {
    return <></>;
  }

  if (props.status === UploadFileStatus.FINISHING_UPLOAD) {
    return (
      <LinearProgress
        variant="indeterminate"
        sx={{
          ...classes.uploadProgress,
          colorPrimary: classes.uploadingColor,
          barColorPrimary: classes.uploadingColor
        }}
      />
    );
  }

  if (props.status === UploadFileStatus.COMPLETE) {
    return <></>;
  }

  if (props.status === UploadFileStatus.FAILED) {
    return (
      <LinearProgress
        variant="determinate"
        value={0}
        sx={{ ...classes.uploadProgress, colorPrimary: classes.errorBgColor, barColorPrimary: classes.errorBgColor }}
      />
    );
  }

  // status is PENDING or UPLOADING
  return (
    <LinearProgress
      variant="determinate"
      value={props.progress}
      sx={{ ...classes.uploadProgress, colorPrimary: classes.uploadingColor, barColorPrimary: classes.uploadingColor }}
    />
  );
};

export default SampleSiteFileUploadItemProgressBar;
