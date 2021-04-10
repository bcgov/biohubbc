import { Box, IconButton, LinearProgress, List, ListItem, makeStyles, Theme, Typography } from '@material-ui/core';
import { mdiCheck, mdiWindowClose } from '@mdi/js';
import Icon from '@mdi/react';
import axios, { CancelTokenSource } from 'axios';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React, { useState } from 'react';
import { FileError, FileRejection } from 'react-dropzone';
import DropZone from './DropZone';

const useStyles = makeStyles((theme: Theme) => ({
  dropZone: {
    border: '2px dashed grey',
    cursor: 'default'
  },
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
  PROCESSING = 'Finishing Upload',
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

export interface IUploadFileListProps {
  files: IUploadFile[];
}

export interface IFileUploadProps {
  projectId: number;
}

export const FileUpload: React.FC<IFileUploadProps> = (props) => {
  const classes = useStyles();

  const biohubApi = useBiohubApi();

  const [files, setFiles] = useState<IUploadFile[]>([]);

  /**
   * Handles files which are added (via either drag/drop or browsing).
   *
   * @param {File[]} filesToAdd files that pass the basic DropZone size/quantity checks
   * @param {FileRejection[]} rejectedFiles files that did not pass the basic DropZone size/quantity checks
   */
  const onFiles = (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    const newAcceptedFiles: IUploadFile[] = [];
    const newRejectedFiles: IUploadFile[] = [];

    // Parse out any files that have already been added
    acceptedFiles.forEach((item) => {
      const isAlreadyAdded = files.some((existingFile) => existingFile.file.name === item.name);

      if (isAlreadyAdded) {
        return;
      }

      newAcceptedFiles.push({
        file: item,
        status: UploadFileStatus.PENDING,
        progress: 0,
        cancelTokenSource: axios.CancelToken.source()
      });
    });

    // Parse out any rejected files that have already been added
    rejectedFiles.forEach((item) => {
      const isAlreadyRejected = files.some((existingFile) => existingFile.file.name === item.file.name);

      if (isAlreadyRejected) {
        return;
      }

      console.log(item);

      newRejectedFiles.push({
        file: item.file,
        status: UploadFileStatus.PENDING,
        progress: 0,
        cancelTokenSource: axios.CancelToken.source(),
        error: getErrorCodeMessage(item.errors[0])
      });
    });

    setFiles((currentFiles) => {
      return [...currentFiles, ...newAcceptedFiles, ...newRejectedFiles];
    });

    newAcceptedFiles.forEach((item) => startFileUpload(item));
  };

  const getErrorCodeMessage = (fileError: FileError) => {
    switch (fileError.code) {
      case 'file-too-large':
        return 'File size exceeds maximum';
      case 'too-many-files':
        return 'Number of files uploaded at once exceeds maximum';
      default:
        return 'Encountered an unexpected error';
    }
  };

  /**
   * Update the array of files.
   *
   * @param {IUploadFile} fileToUpdate
   * @param {Partial<IUploadFile>} updatedFileProperties
   */
  const updateFile = (fileToUpdate: IUploadFile, updatedFileAttributes: Partial<IUploadFile>) => {
    setFiles((currentFiles) => {
      return currentFiles.map((item) => {
        if (item.file.name === fileToUpdate.file.name) {
          return { ...item, ...updatedFileAttributes };
        }

        return item;
      });
    });
  };

  /**
   * Cancel the upload or delete the file if the upload has passed the point of cancelling.
   *
   * @param {IUploadFile} fileToCancel
   */
  const cancelUpload = (fileToCancel: IUploadFile) => {
    // Cancel any active upload request for this file
    // Note: this only cancels the initial upload of the file data to the API, and not the upload from the API to S3.
    fileToCancel.cancelTokenSource.cancel();

    removeFile(fileToCancel);
  };

  /**
   * Remove the file from the list.
   *
   * @param {IUploadFile} fileToDelete
   */
  const removeFile = (fileToRemove: IUploadFile) => {
    setFiles((currentFiles) => currentFiles.filter((item) => item.file.name !== fileToRemove.file.name));
  };

  /**
   * Updates a file's status, and kicks off the file upload request.
   *
   * @param {IUploadFile} fileToUpload
   */
  const startFileUpload = (fileToUpload: IUploadFile) => {
    updateFile(fileToUpload, {
      status: UploadFileStatus.UPLOADING
    });

    uploadFile(fileToUpload);
  };

  /**
   * Upload a single file. Update its state on progress, resolve, and reject events.
   *
   * @param {IUploadFile} fileToUpload
   */
  const uploadFile = async (fileToUpload: IUploadFile) => {
    biohubApi.project
      .uploadProjectAttachments(
        props.projectId,
        [fileToUpload.file],
        fileToUpload.cancelTokenSource,
        (progressEvent: ProgressEvent) => handleFileUploadProgress(fileToUpload, progressEvent)
      )
      .then(
        () => handleFileUploadSuccess(fileToUpload),
        (error: APIError) => handleFileUploadFailure(fileToUpload, error)
      );
  };

  /**
   * Update a file's state on progress.
   *
   * @param {IUploadFile} fileToUpdate
   * @param {ProgressEvent} progressEvent
   */
  const handleFileUploadProgress = (fileToUpdate: IUploadFile, progressEvent: ProgressEvent) => {
    updateFile(fileToUpdate, {
      progress: Math.round((progressEvent.loaded / progressEvent.total) * 100),
      status: progressEvent.loaded === progressEvent.total ? UploadFileStatus.PROCESSING : UploadFileStatus.UPLOADING
    });
  };

  /**
   * Update a file's state on successful upload.
   *
   * @param {IUploadFile} fileToUpdate
   */
  const handleFileUploadSuccess = (fileToUpdate: IUploadFile) => {
    updateFile(fileToUpdate, { status: UploadFileStatus.COMPLETE, progress: 100 });
  };

  /**
   * Update a file's state on un-successful upload.
   *
   * @param {IUploadFile} fileToUpdate
   * @param {APIError} error
   */
  const handleFileUploadFailure = (fileToUpdate: IUploadFile, error: APIError) => {
    updateFile(fileToUpdate, { status: UploadFileStatus.FAILED, error: error.message });
  };

  const ProgressBar = (progressBarProps: { file: IUploadFile }) => {
    const { file } = progressBarProps;

    if (file.status === UploadFileStatus.PROCESSING) {
      return (
        <LinearProgress
          variant="indeterminate"
          classes={{ colorPrimary: classes.uploadingColor, barColorPrimary: classes.uploadingBarColor }}
        />
      );
    }

    if (file.status === UploadFileStatus.COMPLETE) {
      return (
        <LinearProgress
          variant="determinate"
          value={100}
          classes={{ colorPrimary: classes.completeColor, barColorPrimary: classes.completeBarColor }}
        />
      );
    }

    if (file.status === UploadFileStatus.FAILED) {
      return (
        <LinearProgress
          variant="determinate"
          value={0}
          classes={{ colorPrimary: classes.failedColor, barColorPrimary: classes.failedBarColor }}
        />
      );
    }

    // status is pending or uploading
    return (
      <LinearProgress
        variant="determinate"
        value={file.progress}
        classes={{ colorPrimary: classes.uploadingColor, barColorPrimary: classes.uploadingBarColor }}
      />
    );
  };

  const FileButton = (fileButtonProps: { file: IUploadFile }) => {
    const { file } = fileButtonProps;

    if (file.status === UploadFileStatus.PENDING || file.status === UploadFileStatus.UPLOADING) {
      return (
        <Box width="4rem" display="flex" justifyContent="flex-end" alignContent="center">
          <IconButton title="Cancel Upload" aria-label="cancel upload" onClick={() => cancelUpload(file)}>
            <Icon path={mdiWindowClose} size={1} />
          </IconButton>
        </Box>
      );
    }

    if (file.status === UploadFileStatus.COMPLETE) {
      return (
        <Box width="4rem" p={'0.75rem'} display="flex" justifyContent="flex-end" alignContent="center">
          <Icon path={mdiCheck} className={classes.completeIcon} size={1} />
        </Box>
      );
    }

    if (file.status === UploadFileStatus.FAILED) {
      return (
        <Box width="4rem" display="flex" justifyContent="flex-end" alignContent="center">
          <IconButton title="Clear File" aria-label="clear file" onClick={() => removeFile(file)}>
            <Icon path={mdiWindowClose} className={classes.errorIcon} size={1} />
          </IconButton>
        </Box>
      );
    }

    // status is processing, show no icon
    return <Box width="4rem" />;
  };

  /**
   * Builds and returns a file list.
   *
   * @param {*} uploadFileListProps
   * @return {*}
   */
  const UploadFileList: React.FC<IUploadFileListProps> = (uploadFileListProps) => {
    if (!files?.length) {
      return <></>;
    }

    const listItems = uploadFileListProps.files.map((file, index) => {
      return (
        <ListItem key={index} className={classes.uploadListItem}>
          <Box p={1} display="flex" width="100%" alignContent="middle">
            <Box display="flex" flexDirection="column" width="100%">
              <Box mb={2} display="flex" justifyContent="space-between">
                <Typography>{file.file.name}</Typography>
                <Typography>{file.error || file.status}</Typography>
              </Box>
              <Box>
                <ProgressBar file={file} />
              </Box>
            </Box>
            <Box ml={2} display="flex" alignItems="center">
              <FileButton file={file} />
            </Box>
          </Box>
        </ListItem>
      );
    });

    return <List>{listItems}</List>;
  };

  return (
    <Box>
      <Box mb={2} className={classes.dropZone}>
        <DropZone projectId={props.projectId} onFiles={onFiles} />
      </Box>
      <Box>
        <UploadFileList files={files} />
      </Box>
    </Box>
  );
};

export default FileUpload;
