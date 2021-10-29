import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import LinearProgress from '@material-ui/core/LinearProgress';
import ListItem from '@material-ui/core/ListItem';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { mdiCheck, mdiTrashCanOutline, mdiFileOutline } from '@mdi/js';
import Icon from '@mdi/react';
import axios, { CancelTokenSource } from 'axios';
import { APIError } from 'hooks/api/useAxios';
import useIsMounted from 'hooks/useIsMounted';
import React, { useCallback, useEffect, useState } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  uploadProgress: {
    marginTop: theme.spacing(0.5)
  },
  uploadListItemBox: {
    width: '100%',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: theme.palette.action.disabled,
    borderRadius: '4px'
  },
  uploadingColor: {
    color: theme.palette.primary.main
  },
  completeColor: {
    color: theme.palette.success.main
  },
  completeBgColor: {
    background: theme.palette.success.main
  },
  errorColor: {
    color: theme.palette.error.main
  },
  errorBgColor: {
    background: theme.palette.error.main + '44'
  },
  fileIconColor: {
    color: theme.palette.action.disabled
  }
}));

export enum UploadFileStatus {
  STAGED = 'Ready for upload',
  PENDING = 'Pending',
  UPLOADING = 'Uploading',
  FINISHING_UPLOAD = 'Finishing upload',
  FAILED = 'Failed',
  COMPLETE = 'Complete'
}

export interface IUploadFile {
  file: File;
  status: UploadFileStatus;
  progress: number;
  cancelTokenSource: CancelTokenSource;
  error?: string;
}

export type IUploadHandler<T = any> = (
  file: File,
  cancelToken: CancelTokenSource,
  handleFileUploadProgress: (progressEvent: ProgressEvent) => void
) => Promise<T>;

export type IFileHandler = (file: File | null) => void;

export type IOnUploadSuccess = (response: any) => void;

export interface IFileUploadItemProps {
  uploadHandler: IUploadHandler;
  onSuccess?: IOnUploadSuccess;
  file: File;
  error?: string;
  onCancel: () => void;
  fileHandler?: IFileHandler;
  status?: UploadFileStatus;
}

const FileUploadItem: React.FC<IFileUploadItemProps> = (props) => {
  const isMounted = useIsMounted();
  const classes = useStyles();

  const { uploadHandler, fileHandler, onSuccess } = props;

  const [file] = useState<File>(props.file);
  const [error, setError] = useState<string | undefined>(props.error);

  const [status, setStatus] = useState<UploadFileStatus>(props.status || UploadFileStatus.PENDING);
  const [progress, setProgress] = useState<number>(0);
  const [cancelToken] = useState<CancelTokenSource>(axios.CancelToken.source());

  // indicates that the active requests should cancel
  const [initiateCancel, setInitiateCancel] = useState<boolean>(false);
  // indicates that the active requests are in a state where they can be safely cancelled
  const [isSafeToCancel, setIsSafeToCancel] = useState<boolean>(false);

  const handleFileUploadError = useCallback(() => {
    setStatus(UploadFileStatus.FAILED);
    setProgress(0);
  }, []);

  useEffect(() => {
    if (error) {
      handleFileUploadError();
      return;
    }

    fileHandler?.(file);

    if (status !== UploadFileStatus.PENDING) {
      return;
    }

    const handleFileUploadProgress = (progressEvent: ProgressEvent) => {
      if (!isMounted()) {
        // component is unmounted, don't perform any state changes when the upload request emits progress
        return;
      }

      setProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));

      if (progressEvent.loaded === progressEvent.total) {
        setStatus(UploadFileStatus.FINISHING_UPLOAD);
      }
    };

    const handleFileUploadSuccess = (response?: any) => {
      if (!isMounted()) {
        // component is unmounted, don't perform any state changes when the upload request resolves
        return;
      }

      setStatus(UploadFileStatus.COMPLETE);
      setProgress(100);

      // the upload request has finished and its safe to call the onCancel prop
      setIsSafeToCancel(true);

      onSuccess?.(response);
    };

    uploadHandler(file, cancelToken, handleFileUploadProgress)
      .then(handleFileUploadSuccess, (error: APIError) => {
        setError(error?.message);
      })
      .catch();

    setStatus(UploadFileStatus.UPLOADING);
  }, [
    file,
    status,
    cancelToken,
    uploadHandler,
    fileHandler,
    onSuccess,
    isMounted,
    initiateCancel,
    error,
    handleFileUploadError
  ]);

  useEffect(() => {
    if (!isMounted()) {
      // component is unmounted, don't perform any state changes when the upload request rejects
      return;
    }

    if (error && !initiateCancel && !isSafeToCancel) {
      // the api request will reject if it is cancelled OR if it fails, so only conditionally treat the upload as a failure
      handleFileUploadError();
    }

    // the upload request has finished (either from failing or cancelling) and its safe to call the onCancel prop
    setIsSafeToCancel(true);
  }, [error, initiateCancel, isSafeToCancel, isMounted, handleFileUploadError]);

  useEffect(() => {
    if (!initiateCancel) {
      return;
    }

    // cancel the active request
    cancelToken.cancel();
  }, [initiateCancel, cancelToken]);

  useEffect(() => {
    if (!isSafeToCancel || !initiateCancel) {
      return;
    }

    // trigger the parents onCancel hook, as this component is in a state where it can be safely cancelled
    props.onCancel();
    props.fileHandler?.(null);
  }, [initiateCancel, isSafeToCancel, props]);

  return (
    <ListItem key={file.name} disableGutters>
      <Box className={classes.uploadListItemBox}>
        <Box display="flex" flexDirection="row" alignItems="center" p={2} width="100%">
          <Icon path={mdiFileOutline} size={1.5} className={error ? classes.errorColor : classes.fileIconColor} />
          <Box pl={1.5} flex="1 1 auto">
            <Box display="flex" flexDirection="row" flex="1 1 auto" alignItems="center" height="3rem">
              <Box flex="1 1 auto">
                <Typography variant="body2" component="div">
                  <strong>{file.name}</strong>
                </Typography>
                <Typography variant="caption" component="div">
                  {error || status}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <MemoizedActionButton status={status} onCancel={() => setInitiateCancel(true)} />
              </Box>
            </Box>
            <MemoizedProgressBar status={status} progress={progress} />
          </Box>
        </Box>
      </Box>
    </ListItem>
  );
};

export default FileUploadItem;

export const MemoizedFileUploadItem = React.memo(FileUploadItem, (prevProps, nextProps) => {
  return prevProps.file.name === nextProps.file.name;
});

interface IActionButtonProps {
  status: UploadFileStatus;
  onCancel: () => void;
}

/**
 * Upload action button.
 *
 * Changes color and icon depending on the status.
 *
 * @param {*} props
 * @return {*}
 */
const ActionButton: React.FC<IActionButtonProps> = (props) => {
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

export const MemoizedActionButton = React.memo(ActionButton, (prevProps, nextProps) => {
  return prevProps.status === nextProps.status;
});

interface IProgressBarProps {
  status: UploadFileStatus;
  progress: number;
}

/**
 * Upload progress bar.
 *
 * Changes color and style depending on the status.
 *
 * @param {*} props
 * @return {*}
 */
const ProgressBar: React.FC<IProgressBarProps> = (props) => {
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

export const MemoizedProgressBar = React.memo(ProgressBar, (prevProps, nextProps) => {
  return prevProps.status === nextProps.status && prevProps.progress === nextProps.progress;
});
