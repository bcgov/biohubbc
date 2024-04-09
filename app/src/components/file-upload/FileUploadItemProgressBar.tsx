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
      color: theme.palette.primary.main
    },
    completeBgColor: {
      color: theme.palette.success.main
    },
    errorBgColor: {
      color: theme.palette.error.main + '44'
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
          '&.MuiLinearProgress-colorPrimary': {
            backgroundColor: classes.uploadingColor.color
          },
          '& .MuiLinearProgress-barColorPrimary': {
            backgroundColor: classes.uploadingColor.color
          }
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
          '&.MuiLinearProgress-colorPrimary': {
            backgroundColor: classes.completeBgColor.color
          },
          '& .MuiLinearProgress-barColorPrimary': {
            backgroundColor: classes.completeBgColor.color
          }
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
          '&.MuiLinearProgress-colorPrimary': {
            backgroundColor: classes.errorBgColor.color
          },
          '& .MuiLinearProgress-barColorPrimary': {
            backgroundColor: classes.errorBgColor.color
          }
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
        '&.MuiLinearProgress-colorPrimary': {
          backgroundColor: classes.uploadingColor.color
        },
        '& .MuiLinearProgress-barColorPrimary': {
          backgroundColor: classes.uploadingColor.color
        }
      }}
    />
  );
};

export default FileUploadItemProgressBar;
