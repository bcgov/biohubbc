/* eslint-disable */
// @ts-nocheck
import { Box, IconButton, LinearProgress, List, ListItem, makeStyles, Typography } from '@material-ui/core';
import { mdiWindowClose } from '@mdi/js';
import Icon from '@mdi/react';
import axios, { CancelTokenSource } from 'axios';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React, { useState } from 'react';
import DropZone from './DropZone';

const useStyles = makeStyles(() => ({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },
  dropZone: {
    border: '2px dashed grey',
    cursor: 'default'
  },
  uploadList: {},
  uploadListItem: {
    border: '1px solid grey'
  },
  uploadListStatus: {
    textTransform: 'capitalize'
  }
}));

const MAX_FILES = Number(process.env.REACT_APP_MAX_FILES) || 10;
const MAX_FILE_SIZE_BYTES = Number(process.env.REACT_APP_MAX_FILE_SIZE) || 52428800; // bytes
const MAX_FILE_SIZE_MEGABYTES = Math.round(MAX_FILE_SIZE_BYTES / 1048576);

export enum UploadFileStatus {
  REJECTED = 'rejected',
  PENDING = 'pending',
  UPLOADING = 'uploading',
  FAILED = 'failed',
  COMPLETE = 'complete'
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
   */
  const onFiles = (filesToAdd: File[]) => {
    const newAcceptedFiles: IUploadFile[] = [];

    // Parse out any files that have already been added
    filesToAdd.forEach((item) => {
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

    if (!newAcceptedFiles?.length) {
      // No new files to upload
      return;
    }

    setFiles((currentFiles) => {
      return [...currentFiles, ...newAcceptedFiles];
    });

    newAcceptedFiles.forEach((item) => startFileUpload(item));
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
   * @param {IUploadFile} fileToDelete
   */
  const deleteFile = (fileToDelete: IUploadFile) => {
    // Cancel any active upload request for this file
    // Note: this only cancels the initial upload of the file data to the API, and not the upload from the API to S3.
    fileToDelete.cancelTokenSource.cancel();

    // TODO kick off api delete request

    setFiles((currentFiles) => currentFiles.filter((item) => item.file.name !== fileToDelete.file.name));
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
      .uploadProjectArtifacts(
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
    updateFile(fileToUpdate, { progress: Math.round((progressEvent.loaded / progressEvent.total) * 100) });
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
                <Typography className={classes.uploadListStatus}>{file.error || file.status}</Typography>
              </Box>
              <Box>
                <LinearProgress variant="determinate" value={file.progress} />
              </Box>
            </Box>
            <Box ml={2}>
              <IconButton
                color="primary"
                title="Delete Attachment"
                aria-label="delete attachment"
                onClick={() => deleteFile(file)}>
                <Icon path={mdiWindowClose} size={1} />
              </IconButton>
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
