import { mdiFileOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import axios, { CancelTokenSource } from 'axios';
import FileUploadItemErrorDetails from 'components/file-upload/FileUploadItemErrorDetails';
import FileUploadItemSubtext from 'components/file-upload/FileUploadItemSubtext';
import { APIError } from 'hooks/api/useAxios';
import useIsMounted from 'hooks/useIsMounted';
import React, { useCallback, useEffect, useState } from 'react';
import { v4 } from 'uuid';
import FileUploadItemActionButton from './FileUploadItemActionButton';
import FileUploadItemProgressBar from './FileUploadItemProgressBar';

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
   * If `true`, show advanced error details on a failed upload, for each upload item.
   *
   * @type {boolean}
   * @memberof IFileUploadItemProps
   */
  enableErrorDetails?: boolean;
  /**
   * A component that renders a subtext string for each file upload item.
   * If not provided, a default will be used.
   *
   * @memberof IFileUploadItemProps
   */
  SubtextComponent?: (props: ISubtextProps) => JSX.Element;
  /**
   * A component that renders an action button for each file upload item.
   * If not provided, a default will be used.
   *
   * @memberof IFileUploadItemProps
   */
  ActionButtonComponent?: (props: IActionButtonProps) => JSX.Element;
  /**
   * A component that renders a progress bar for each file upload item.
   * If not provided, a default will be used.
   *
   * @memberof IFileUploadItemProps
   */
  ProgressBarComponent?: (props: IProgressBarProps) => JSX.Element;
}

export interface ISubtextProps {
  file: File;
  status: UploadFileStatus;
  progress: number;
  error?: string;
  errorDetails?: { _id: string; message: string }[];
}

export interface IErrorDetailsProps {
  error?: string;
  errorDetails?: { _id: string; message: string }[];
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

  const { uploadHandler, fileHandler, onSuccess, SubtextComponent, ActionButtonComponent, ProgressBarComponent } =
    props;

  const [file] = useState<File>(props.file);

  const [error, setError] = useState<string | undefined>(props.error);
  const [errorDetails, setErrorDetails] = useState<{ _id: string; message: string }[] | undefined>();

  const [status, setStatus] = useState<UploadFileStatus>(props.status ?? UploadFileStatus.PENDING);
  const [progress, setProgress] = useState<number>(0);
  const [cancelToken] = useState<CancelTokenSource>(axios.CancelToken.source());

  // indicates that the active requests should cancel
  const [initiateCancel, setInitiateCancel] = useState<boolean>(false);
  // indicates that the active requests are in a state where they can be safely cancelled
  const [isSafeToCancel, setIsSafeToCancel] = useState<boolean>(false);

  const Subtext = SubtextComponent ?? FileUploadItemSubtext;

  const MemoizedActionButton = React.memo(
    ActionButtonComponent ?? FileUploadItemActionButton,
    (prevProps, nextProps) => {
      // Only re-render if the status changes
      return prevProps.status === nextProps.status;
    }
  );

  const MemoizedProgressBar = React.memo(ProgressBarComponent ?? FileUploadItemProgressBar, (prevProps, nextProps) => {
    // Only re-render if the status or progress changes
    return prevProps.status === nextProps.status && prevProps.progress === nextProps.progress;
  });

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
        setErrorDetails(
          error.errors?.map((error) => {
            return { _id: v4(), message: String(error) };
          })
        );
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
    <ListItem
      key={file.name}
      secondaryAction={<MemoizedActionButton status={status} onCancel={() => setInitiateCancel(true)} />}
      sx={{
        flexWrap: 'wrap',
        borderStyle: 'solid',
        borderWidth: '1px',
        borderRadius: '6px',
        background: grey[100],
        borderColor: grey[300],
        '& + li': {
          mt: 1
        },
        '& .MuiListItemSecondaryAction-root': {
          top: '36px'
        },
        '&:last-child': {
          borderBottomStyle: 'solid',
          borderBottomWidth: '1px',
          borderBottomColor: grey[300]
        }
      }}>
      <ListItemIcon
        sx={{
          '&.fileIconColor': {
            color: 'text.secondary'
          },
          '&.error': {
            color: 'error.main'
          }
        }}>
        <Icon path={mdiFileOutline} size={1.25} className={error ? 'errorColor' : 'fileIconColor'} />
      </ListItemIcon>
      <ListItemText
        primary={file.name}
        secondary={
          <Subtext
            file={file}
            status={status}
            progress={progress}
            error={error}
            errorDetails={[{ _id: '123123', message: 'awdawdawdawdaw' }]}
          />
        }
        sx={{
          '& .MuiListItemText-primary': {
            fontWeight: 700
          }
        }}></ListItemText>

      <Box
        sx={{
          ml: 5,
          width: '100%',
          '& .MuiLinearProgress-root': {
            mb: 1
          }
        }}>
        <MemoizedProgressBar status={status} progress={progress} />
      </Box>
      {props.enableErrorDetails && (
        <Box sx={{ mt: 1, ml: 5, width: '100%' }}>
          <FileUploadItemErrorDetails error={error} errorDetails={errorDetails} />
        </Box>
      )}
    </ListItem>
  );
};

export default FileUploadItem;
