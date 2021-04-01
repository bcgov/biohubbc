import { Box, Button, makeStyles, Typography } from '@material-ui/core';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { DropzoneArea } from 'material-ui-dropzone';
import React, { useState } from 'react';

const useStyles = makeStyles(() => ({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  }
}));

export interface IFileUploadProps {
  projectId: number;
}

export const FileUpload: React.FC<IFileUploadProps> = (props) => {
  const classes = useStyles();

  const biohubApi = useBiohubApi();

  const [files, setFiles] = useState<File[]>([]);
  const [dropzoneText, setDropzoneText] = useState<string>('Select files');
  const [dropzoneInstanceKey, setDropzoneInstanceKey] = useState<number>(0);

  const handleUpload = async () => {
    if (!files || !files.length) {
      setDropzoneText('Select files');
      return;
    }

    try {
      setDropzoneText('Uploading ...');
      const uploadResponse = await biohubApi.project.uploadProjectArtifacts(props.projectId, files);

      if (!uploadResponse) {
        setDropzoneText('Failed to upload, please try again');
      } else {
        setDropzoneText('Success. ' + files.length + ' file' + (files.length > 1 ? 's' : '') + ' uploaded');

        // clear the files state
        setFiles([]);

        // implement the hack to reset the internal state of dropzone
        // https://github.com/react-dropzone/react-dropzone/issues/881
        setDropzoneInstanceKey(dropzoneInstanceKey > 0 ? 0 : 1);
      }
    } catch (error) {
      console.log('Error', error);
    }
  };

  const handleDeleteFile = async (f: File) => {
    let newFiles = files;

    setFiles(
      newFiles.filter(function (elem: File) {
        return elem !== f;
      })
    );
  };

  return (
    <Box>
      <Box key={dropzoneInstanceKey}>
        <DropzoneArea
          dropzoneText={dropzoneText}
          filesLimit={10}
          onChange={(e) => {
            setFiles(e);
          }}
          onDelete={(f) => {
            handleDeleteFile(f);
          }}
          showFileNames={true}
          useChipsForPreview={true}
          showAlerts={['error']}
        />
      </Box>
      <Box>
        <Button variant="contained" color="primary" onClick={handleUpload} className={classes.actionButton}>
          <Typography variant="body1">Upload</Typography>
        </Button>
      </Box>
    </Box>
  );
};

export default FileUpload;
