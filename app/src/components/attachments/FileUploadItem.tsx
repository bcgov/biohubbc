import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import LinearProgress from '@material-ui/core/LinearProgress';
import ListItem from '@material-ui/core/ListItem';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { mdiCheck, mdiWindowClose } from '@mdi/js';
import Icon from '@mdi/react';
import axios, { CancelTokenSource } from 'axios';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useIsMounted from 'hooks/useIsMounted';
import React, { useCallback, useEffect, useState } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  uploadListItem: {
    border: '1px solid grey'
  },
  completeIcon: {
    color: theme.palette.success.main
  },
  errorIcon: {
    color: theme.palette.error.main
  },
  linearProgressBar: {
    height: '10px'
  },
  uploadingColor: {
    backgroundColor: 'rgba(25, 118, 210, 0.5)', // primary.main with reduced opacity
    height: '5px'
  },
  uploadingBarColor: {
    backgroundColor: theme.palette.primary.main
  },
  completeColor: {
    backgroundColor: 'rgba(76, 175, 80, 0.5)', // success.main with reduced opacity
    height: '5px'
  },
  completeBarColor: {
    backgroundColor: theme.palette.success.main
  },
  failedColor: {
    backgroundColor: 'rgba(244, 67, 54, 0.5)', // error.main with reduced opacity
    height: '5px'
  },
  failedBarColor: {
    backgroundColor: theme.palette.error.main
  }
}));

export enum UploadFileStatus {
  PENDING = 'Pending',
  UPLOADING = 'Uploading',
  FINISHING_UPLOAD = 'Finishing Upload',
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

export interface IFileUploadItemProps {
  id: number;
  type: string;
  file: File;
  error?: string;
  onCancel: () => void;
}

const FileUploadItem: React.FC<IFileUploadItemProps> = (props) => {
  const isMounted = useIsMounted();

  const classes = useStyles();

  const biohubApi = useBiohubApi();

  const [file] = useState<File>(props.file);
  const [error, setError] = useState<string | undefined>(props.error);

  const [status, setStatus] = useState<UploadFileStatus>(UploadFileStatus.PENDING);
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

    const handleFileUploadSuccess = () => {
      if (!isMounted()) {
        // component is unmounted, don't perform any state changes when the upload request resolves
        return;
      }

      setStatus(UploadFileStatus.COMPLETE);
      setProgress(100);

      // the upload request has finished and its safe to call the onCancel prop
      setIsSafeToCancel(true);
    };

    if (props.type === 'project') {
      biohubApi.project
        .uploadProjectAttachments(props.id, [file], cancelToken, handleFileUploadProgress)
        .then(handleFileUploadSuccess, (error: APIError) => setError(error?.message))
        .catch();
    } else if (props.type === 'survey') {
      biohubApi.survey
        .uploadSurveyAttachments(props.id, [file], cancelToken, handleFileUploadProgress)
        .then(handleFileUploadSuccess, (error: APIError) => setError(error?.message))
        .catch();
    }

    setStatus(UploadFileStatus.UPLOADING);
  }, [file, biohubApi, status, cancelToken, props.id, props.type, isMounted, initiateCancel, error, handleFileUploadError]);

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
  }, [initiateCancel, isSafeToCancel, props]);

  return (
    <ListItem key={file.name} className={classes.uploadListItem}>
      <Box p={1} display="flex" width="100%" alignContent="middle">
        <Box display="flex" flexDirection="column" width="100%">
          <Box mb={2} display="flex" justifyContent="space-between">
            <Typography>{file.name}</Typography>
            <Typography>{error || status}</Typography>
          </Box>
          <Box>
            <MemoizedProgressBar status={status} progress={progress} />
          </Box>
        </Box>
        <Box ml={2} display="flex" alignItems="center">
          <MemoizedActionButton status={status} onCancel={() => setInitiateCancel(true)} />
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

  if (props.status === UploadFileStatus.PENDING || props.status === UploadFileStatus.UPLOADING) {
    return (
      <Box width="4rem" display="flex" justifyContent="flex-end" alignContent="center">
        <IconButton title="Cancel Upload" aria-label="cancel upload" onClick={() => props.onCancel()}>
          <Icon path={mdiWindowClose} size={1} />
        </IconButton>
      </Box>
    );
  }

  if (props.status === UploadFileStatus.COMPLETE) {
    return (
      <Box width="4rem" p={'0.75rem'} display="flex" justifyContent="flex-end" alignContent="center">
        <Icon path={mdiCheck} className={classes.completeIcon} size={1} />
      </Box>
    );
  }

  if (props.status === UploadFileStatus.FAILED) {
    return (
      <Box width="4rem" display="flex" justifyContent="flex-end" alignContent="center">
        <IconButton title="Remove File" aria-label="remove file" onClick={() => props.onCancel()}>
          <Icon path={mdiWindowClose} className={classes.errorIcon} size={1} />
        </IconButton>
      </Box>
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

  if (props.status === UploadFileStatus.FINISHING_UPLOAD) {
    return (
      <LinearProgress
        variant="indeterminate"
        classes={{ colorPrimary: classes.uploadingColor, barColorPrimary: classes.uploadingBarColor }}
      />
    );
  }

  if (props.status === UploadFileStatus.COMPLETE) {
    return (
      <LinearProgress
        variant="determinate"
        value={100}
        classes={{ colorPrimary: classes.completeColor, barColorPrimary: classes.completeBarColor }}
      />
    );
  }

  if (props.status === UploadFileStatus.FAILED) {
    return (
      <LinearProgress
        variant="determinate"
        value={0}
        classes={{ colorPrimary: classes.failedColor, barColorPrimary: classes.failedBarColor }}
      />
    );
  }

  // status is PENDING or UPLOADING
  return (
    <LinearProgress
      variant="determinate"
      value={props.progress}
      classes={{ colorPrimary: classes.uploadingColor, barColorPrimary: classes.uploadingBarColor }}
    />
  );
};

export const MemoizedProgressBar = React.memo(ProgressBar, (prevProps, nextProps) => {
  return prevProps.status === nextProps.status && prevProps.progress === nextProps.progress;
});
