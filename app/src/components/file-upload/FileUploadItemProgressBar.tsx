import LinearProgress from '@mui/material/LinearProgress';
import useTheme from '@mui/material/styles/useTheme';
import { IProgressBarProps, UploadFileStatus } from './FileUploadItem';

const useStyles = () => {
  const theme = useTheme();

  return {
    uploadProgress: {
      marginTop: theme.spacing(0.5)
    },
    uploadingColor: {
      backgroundColor: theme.palette.primary.main
    },
    completeBgColor: {
      backgroundColor: theme.palette.success.main
    },
    errorBgColor: {
      backgroundColor: theme.palette.error.main + '44'
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
const FileUploadItemProgressBar = (props: IProgressBarProps) => {
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
          '&.MuiLinearProgress-colorPrimary': classes.uploadingColor,
          '& .MuiLinearProgress-barColorPrimary': classes.uploadingColor
        }}
      />
    );
  }

  if (props.status === UploadFileStatus.COMPLETE) {
    return (
      <LinearProgress
        variant="determinate"
        value={100}
        sx={{
          ...classes.uploadProgress,
          '&.MuiLinearProgress-colorPrimary': classes.completeBgColor,
          '& .MuiLinearProgress-barColorPrimary': classes.completeBgColor
        }}
      />
    );
  }

  if (props.status === UploadFileStatus.FAILED) {
    return (
      <LinearProgress
        variant="determinate"
        value={0}
        sx={{
          ...classes.uploadProgress,
          '&.MuiLinearProgress-colorPrimary': classes.errorBgColor,
          '& .MuiLinearProgress-barColorPrimary': classes.errorBgColor
        }}
      />
    );
  }

  // status is PENDING or UPLOADING
  return (
    <LinearProgress
      variant="determinate"
      value={props.progress}
      sx={{
        ...classes.uploadProgress,
        '& .MuiLinearProgress-bar1Determinate': classes.uploadingColor
      }}
    />
  );
};

export default FileUploadItemProgressBar;
