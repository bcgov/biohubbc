import Box from '@material-ui/core/Box';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { ProjectSurveyAttachmentType, ProjectSurveyAttachmentValidExtensions } from 'constants/attachments';
import { default as React, useEffect, useState } from 'react';
import { FileError, FileRejection } from 'react-dropzone';
import { getKeyByValue } from 'utils/Utils';
import ReportMetaForm, { IReportMetaForm } from '../attachments/ReportMetaForm';
import DropZone, { IDropZoneConfigProps } from './DropZone';
import { IUploadHandler, MemoizedFileUploadItem } from './FileUploadItem';
import { useFormikContext } from 'formik';

const useStyles = makeStyles((theme: Theme) => ({
  dropZone: {
    border: '2px dashed grey',
    cursor: 'default'
  },
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
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
  isUploadingReport: boolean;
  uploadHandler: IUploadHandler;
  onSuccess?: (response: any) => void;
  dropZoneProps?: Partial<IDropZoneConfigProps>;
}

export const FileUploadWithMeta: React.FC<IFileUploadWithMetaProps> = (props) => {
  const { setFieldValue } = useFormikContext<IReportMetaForm>();

  const classes = useStyles();

  const [files, setFiles] = useState<IUploadFile[]>([]);

  const [fileUploadItems, setFileUploadItems] = useState<any[]>([]);

  const [fileToRemove, setFileToRemove] = useState<string>('');

  const [fileType] = useState<string>(props.isUploadingReport ? 'Report' : 'Image');
  //const [showFinishButton, setShowFinishButton] = useState<boolean>(false);


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
        onSuccess={(response: any) => { setFieldValue('attachmentId', response, true); }}
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

  const fileUploadUI = (
    <Box component="fieldset" mt={3}>
        {props.isUploadingReport &&
          <FormLabel id="report_details" component="legend">
            Attach File
          </FormLabel>
        }
      <Box mt={3} className={classes.dropZone}>
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
  );

  return (
    <Box>
      {fileType && fileType !== 'Report' && fileUploadUI}

      {fileType && fileType === 'Report' && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ReportMetaForm />
          </Grid>

          <Grid item xs={12}>
            {fileUploadUI}
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default FileUploadWithMeta;
