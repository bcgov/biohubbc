import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import List from '@material-ui/core/List';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React, { useEffect, useState } from 'react';
import { FileError, FileRejection } from 'react-dropzone';
import DropZone, { IDropZoneConfigProps } from './DropZone';
import { IUploadHandler, MemoizedFileUploadItem } from './FileUploadItem';
import { getKeyByValue } from 'utils/Utils';
import { ProjectSurveyAttachmentType, ProjectSurveyAttachmentValidExtensions } from 'constants/attachments';

const useStyles = makeStyles((theme: Theme) => ({
  dropZone: {
    border: '2px dashed grey',
    cursor: 'default'
  }
}));

export interface IUploadFile {
  file: File;
  fileType: string;
  error?: string;
}

export interface IUploadFileListProps {
  files: IUploadFile[];
}

export interface IFileUploadWithMetaProps {
  uploadHandler: IUploadHandler;
  onSuccess?: (response: any) => void; // currently only supports single file uploads (multiple will overwrite each other)
  dropZoneProps?: Partial<IDropZoneConfigProps>;
}

export const FileUploadWithMeta: React.FC<IFileUploadWithMetaProps> = (props) => {
  const classes = useStyles();

  const [files, setFiles] = useState<IUploadFile[]>([]);

  const [fileUploadItems, setFileUploadItems] = useState<any[]>([]);

  const [fileToRemove, setFileToRemove] = useState<string>('');

  const [fileType, setFileType] = useState<string>('');

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
      const isAlreadyAdded = files.some((existingFile) => existingFile.file.name === item.name);

      if (isAlreadyAdded) {
        return;
      }

      newAcceptedFiles.push({
        file: item,
        fileType: fileType
      });
    });

    // Parse out any rejected files that have already been added
    rejectedFiles.forEach((item) => {
      const isAlreadyRejected = files.some((existingFile) => existingFile.file.name === item.file.name);

      if (isAlreadyRejected) {
        return;
      }

      newRejectedFiles.push({
        file: item.file,
        fileType: fileType,
        error: getErrorCodeMessage(item.errors[0])
      });
    });

    setFiles((currentFiles) => [...currentFiles, ...newAcceptedFiles, ...newRejectedFiles]);

    setFileUploadItems(
      fileUploadItems.concat([
        ...newAcceptedFiles.map((item) => getFileUploadItem(item.file, item.fileType, item.error)),
        ...newRejectedFiles.map((item) => getFileUploadItem(item.file, item.fileType, item.error))
      ])
    );
  };

  const getFileUploadItem = (file: File, fileType?: string, error?: string) => {
    return (
      <MemoizedFileUploadItem
        key={file.name}
        uploadHandler={props.uploadHandler}
        onSuccess={props.onSuccess}
        file={file}
        fileType={fileType}
        error={error}
        onCancel={() => setFileToRemove(file.name)}
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

  useEffect(() => {
    if (!fileToRemove) {
      return;
    }

    const removeFile = (fileName: string) => {
      const index = files.findIndex((item) => item.file.name === fileName);

      if (index === -1) {
        return;
      }

      setFiles((currentFiles) => {
        const newFiles = [...currentFiles];
        newFiles.splice(index, 1);
        return newFiles;
      });

      setFileUploadItems((currentFileUploadItems) => {
        const newFileUploadItems = [...currentFileUploadItems];
        newFileUploadItems.splice(index, 1);
        return newFileUploadItems;
      });

      setFileToRemove('');
    };

    removeFile(fileToRemove);
  }, [fileToRemove, fileUploadItems, files]);

  return (
    <Box>
      <FormControl fullWidth variant="outlined" required={true} style={{ width: '100%', marginBottom: '1rem' }}>
        <InputLabel id="attachment_type-label">Attachment Type</InputLabel>
        <Select
          id="attachment_type"
          name="attachment_type"
          labelId="attachment_type-label"
          label="Attachment Type"
          value={fileType}
          onChange={(e) => setFileType(e.target.value as string)}
          displayEmpty
          inputProps={{ 'aria-label': 'Attachment Type' }}>
          {Object.keys(ProjectSurveyAttachmentType).map((key) => (
            <MenuItem key={key} value={ProjectSurveyAttachmentType[key]}>
              {ProjectSurveyAttachmentType[key]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {fileType && (
        <Box>
          <Box mb={2} className={classes.dropZone}>
            <DropZone
              onFiles={onFiles}
              acceptedFileExtensions={
                ProjectSurveyAttachmentValidExtensions[getKeyByValue(ProjectSurveyAttachmentType, fileType) || 'OTHER']
              }
            />
          </Box>
          <Box>
            <List>{fileUploadItems}</List>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default FileUploadWithMeta;
