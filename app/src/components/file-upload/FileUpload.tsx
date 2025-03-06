import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import List from '@mui/material/List';
import React, { useRef, useState } from 'react';
import { FileError, FileRejection } from 'react-dropzone';
import DropZone, { IDropZoneConfigProps } from './DropZone';
import FileUploadItem, {
  IFileHandler,
  IFileUploadItemProps,
  IOnUploadSuccess,
  IUploadHandler,
  UploadFileStatus
} from './FileUploadItem';
import FileUploadItemActionButton from './FileUploadItemActionButton';
import FileUploadItemProgressBar from './FileUploadItemProgressBar';

export interface IUploadFile {
  file: File;
  error?: string;
}

export type IReplaceHandler = () => void;

export interface IFileUploadProps {
  /**
   * Callback fired for each file in the list
   *
   * @type {IUploadHandler}
   * @memberof IFileUploadProps
   */
  uploadHandler?: IUploadHandler;
  /**
   * Callback fired for each accepted file in the list (that do not have any `DropZone` errors (size, count, extension).
   *
   * @type {IFileHandler}
   * @memberof IFileUploadProps
   */
  fileHandler?: IFileHandler;
  /**
   * Callback fired when `uploadHandler` runs successfully for a given file. Will run once for each file that is
   * uploaded.
   *
   * @type {IOnUploadSuccess}
   * @memberof IFileUploadProps
   */
  onSuccess?: IOnUploadSuccess;
  /**
   * Manually dictate the status.
   *
   * Note: some component events are automatically triggered based on a change of status.
   *
   * @type {UploadFileStatus}
   * @memberof IFileUploadProps
   */
  status?: UploadFileStatus;
  /**
   * If the component should replace the selected files, rather than appending them.
   * Default: false
   *
   * Example:
   * - WIth replace=false, selecting FileA and then selecting FileB will result in both FileA and FileB in the upload
   * list.
   * - With replace=true, selecting FileA and then selecting FileB will result in only FileB in the upload list.
   *
   * Note: This will not change how many files are uploaded, only how many files appear in the list. So if
   * a file is in the middle of uploading when it is replaced, that file will still continue to upload even though it
   * is not visible in the upload list.
   *
   * @type {boolean}
   * @memberof IFileUploadProps
   */
  replace?: boolean;
  /**
   * Callback fired when files are replaced.
   *
   * Note: Does nothing if `replace` is not set to `true`.
   *
   * @type {IReplaceHandler}
   * @memberof IFileUploadProps
   */
  onReplace?: IReplaceHandler;
  /**
   * Callback fired when files are removed.
   *
   * @memberof IFileUploadProps
   */
  onRemove?: (fileName: string) => void;
  /**
   * If `true`, hides the drop zone when the maximum number of allowed files has been reached.
   *
   * @type {boolean}
   * @memberof IFileUploadProps
   */
  hideDropZoneOnMaxFiles?: boolean;
  /**
   * Optional drop zone props.
   *
   * @type {Partial<IDropZoneConfigProps>}
   * @memberof IFileUploadProps
   */
  dropZoneProps?: Partial<IDropZoneConfigProps>;
  /**
   * If `true`, show advanced error details on a failed upload, for each upload item.
   *
   * @type {boolean}
   * @memberof IFileUploadProps
   */
  enableErrorDetails?: boolean;
  /**
   * A component that renders a file Upload item.
   *
   * @memberof IFileUploadProps
   */
  FileUploadItemComponent?: (props: IFileUploadItemProps) => JSX.Element;
  /**
   * Optional prop overrides for `FileUploadItemComponent`.
   *
   * @type {Partial<IFileUploadItemProps>}
   * @memberof IFileUploadProps
   */
  FileUploadItemComponentProps?: Partial<IFileUploadItemProps>;
}

export const FileUpload = (props: IFileUploadProps) => {
  const files = useRef<IUploadFile[]>([]);

  const [fileUploadItems, setFileUploadItems] = useState<any[]>([]);

  const MemoizedFileUploadItem = React.memo(props.FileUploadItemComponent ?? FileUploadItem, (prevProps, nextProps) => {
    return prevProps.file.name === nextProps.file.name;
  });

  /**
   * Handles files which are added (via either drag/drop or browsing).
   *
   * @param {File[]} filesToAdd files that pass the basic DropZone size/quantity/type checks
   * @param {FileRejection[]} rejectedFiles files that did not pass the basic DropZone size/quantity/type checks
   */
  const onFiles = (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    const newAcceptedFiles: IUploadFile[] = [];
    const newRejectedFiles: IUploadFile[] = [];

    // Parse out any files that have already been added
    acceptedFiles.forEach((item) => {
      const isAlreadyAdded = files.current.some((existingFile) => existingFile.file.name === item.name);

      if (isAlreadyAdded) {
        return;
      }

      newAcceptedFiles.push({
        file: item
      });
    });

    // Parse out any rejected files that have already been added
    rejectedFiles.forEach((item) => {
      const isAlreadyRejected = files.current.some((existingFile) => existingFile.file.name === item.file.name);

      if (isAlreadyRejected) {
        return;
      }

      newRejectedFiles.push({
        file: item.file,
        error: getErrorCodeMessage(item.errors[0])
      });
    });

    if (props.replace) {
      // Replace current files with new files
      files.current = [...newAcceptedFiles, ...newRejectedFiles];
      setFileUploadItems([
        ...newAcceptedFiles.map((item) => getFileUploadItem(item.file, item.error)),
        ...newRejectedFiles.map((item) => getFileUploadItem(item.file, item.error))
      ]);
      props.onReplace?.();
    } else {
      // Append new files to current files
      files.current = [...files.current, ...newAcceptedFiles, ...newRejectedFiles];
      setFileUploadItems(
        fileUploadItems.concat([
          ...newAcceptedFiles.map((item) => getFileUploadItem(item.file, item.error)),
          ...newRejectedFiles.map((item) => getFileUploadItem(item.file, item.error))
        ])
      );
    }
  };

  const getFileUploadItem = (file: File, error?: string) => {
    return (
      <MemoizedFileUploadItem
        key={file.name}
        uploadHandler={props.uploadHandler}
        onSuccess={props.onSuccess}
        file={file}
        error={error}
        onCancel={() => removeFile(file.name)}
        fileHandler={props.fileHandler}
        status={props.status}
        enableErrorDetails={props.enableErrorDetails}
        ActionButtonComponent={FileUploadItemActionButton}
        ProgressBarComponent={FileUploadItemProgressBar}
        {...props.FileUploadItemComponentProps}
      />
    );
  };

  const getErrorCodeMessage = (fileError: FileError) => {
    switch (fileError.code) {
      case 'file-too-large':
        return 'File size exceeds maximum';
      case 'too-many-files':
        return 'Number of files uploaded at once exceeds maximum';
      case 'file-invalid-type':
        return 'File type is not compatible';
      default:
        return 'Encountered an unexpected error';
    }
  };

  const removeFile = (fileName: string) => {
    // Find index of file to remove
    const index = files.current.findIndex((item) => item.file.name === fileName);

    if (index === -1) {
      return;
    }

    // Update array of files
    const newFiles = [...files.current];
    newFiles.splice(index, 1);
    files.current = newFiles;

    // Update array of file item components
    setFileUploadItems((currentFileUploadItems) => {
      const newFileUploadItems = [...currentFileUploadItems];
      newFileUploadItems.splice(index, 1);
      return newFileUploadItems;
    });

    // If provided, call parent onRemove callback
    props.onRemove?.(fileName);
  };

  // Whether or not to hide the drop zone when the maximum number of allowed files has been reached
  const hideDropZoneOnMaxFiles =
    props.hideDropZoneOnMaxFiles &&
    props.dropZoneProps?.maxNumFiles &&
    files.current.length >= props.dropZoneProps.maxNumFiles;

  return (
    <Box width={'100%'}>
      {!hideDropZoneOnMaxFiles && (
        <Box
          sx={{
            clear: 'both',
            borderRadius: '6px',
            borderStyle: 'dashed',
            borderWidth: '2px',
            borderColor: grey[500],
            transition: 'all ease-out 0.2s',
            '&:hover, &:focus': {
              borderColor: 'primary.main',
              backgroundColor: grey[100]
            },
            cursor: 'pointer'
          }}>
          <DropZone onFiles={onFiles} {...props.dropZoneProps} />
        </Box>
      )}
      <Box>
        <List>{fileUploadItems}</List>
      </Box>
    </Box>
  );
};

export default FileUpload;
