import { mdiFileOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import axios, { CancelTokenSource } from 'axios';
import { APIError } from 'hooks/api/useAxios';
import useIsMounted from 'hooks/useIsMounted';
import React, { useCallback, useEffect, useState } from 'react';
import FileUploadItemActionButton from './FileUploadItemActionButton';
import FileUploadItemProgressBar from './FileUploadItemProgressBar';

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
  errorColor: {
    color: theme.palette.error.main
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
  /**
   * A file upload callback fired for each file.
   *
   * @type {IUploadHandler}
   * @memberof IFileUploadItemProps
   */
  uploadHandler: IUploadHandler;
  /**
   * An optional callback fired if the file upload is successful.
   *
   * @type {IOnUploadSuccess}
   * @memberof IFileUploadItemProps
   */
  onSuccess?: IOnUploadSuccess;
  /**
   * The file being uploaded.
   *
   * @type {File}
   * @memberof IFileUploadItemProps
   */
  file: File;
  /**
   * An optional initial error to display for this file upload item.
   *
   * @type {string}
   * @memberof IFileUploadItemProps
   */
  error?: string;
  /**
   * A callback fired when the file upload is cancelled or removed.
   *
   * @memberof IFileUploadItemProps
   */
  onCancel: () => void;
  /**
   * An optional callback fired for each file.
   *
   * @type {IFileHandler}
   * @memberof IFileUploadItemProps
   */
  fileHandler?: IFileHandler;
  /**
   * The current status of the file upload item.
   *
   * @type {UploadFileStatus}
   * @memberof IFileUploadItemProps
   */
  status?: UploadFileStatus;
  /**
   * A component that renders an action button for each file upload item.
   *
   * @memberof IFileUploadItemProps
   */
  ActionButtonComponent?: (props: IActionButtonProps) => JSX.Element;
  /**
   * A component that renders a progress bar for each file upload item.
   *
   * @memberof IFileUploadItemProps
   */
  ProgressBarComponent?: (props: IProgressBarProps) => JSX.Element;
}

export interface IActionButtonProps {
  status: UploadFileStatus;
  onCancel: () => void;
}

export interface IProgressBarProps {
  status: UploadFileStatus;
  progress: number;
}

const FileUploadItem = (props: IFileUploadItemProps) => {
  const isMounted = useIsMounted();
  const classes = useStyles();

  const { uploadHandler, fileHandler, onSuccess, ActionButtonComponent, ProgressBarComponent } = props;

  const MemoizedActionButton = React.memo(
    ActionButtonComponent || FileUploadItemActionButton,
    (prevProps, nextProps) => {
      return prevProps.status === nextProps.status;
    }
  );

  const MemoizedProgressBar = React.memo(ProgressBarComponent || FileUploadItemProgressBar, (prevProps, nextProps) => {
    return prevProps.status === nextProps.status && prevProps.progress === nextProps.progress;
  });

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
