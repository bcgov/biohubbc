import { Box, Link, makeStyles, Typography } from '@material-ui/core';
import { mdiTrayPlus } from '@mdi/js';
import Icon from '@mdi/react';
import React from 'react';
import Dropzone from 'react-dropzone';

const useStyles = makeStyles(() => ({
  browseLink: {
    cursor: 'pointer'
  }
}));

const MAX_FILES = Number(process.env.REACT_APP_MAX_FILES) || 10;
const MAX_FILE_SIZE_BYTES = Number(process.env.REACT_APP_MAX_FILE_SIZE) || 52428800;
const MAX_FILE_SIZE_MEGABYTES = Math.round(MAX_FILE_SIZE_BYTES / 1048576);

export interface IFileUploadProps {
  /**
   * Project ID.
   *
   * @type {number}
   * @memberof IFileUploadProps
   */
  projectId: number;
  /**
   * Function called when files are added (via either drag/drop or browsing).
   *
   * @memberof IFileUploadProps
   */
  onFiles: (files: File[]) => void;
  /**
   * Maximum number of files allowed. Defaults to REACT_APP_MAX_FILES or 10.
   *
   * @type {number}
   * @memberof IFileUploadProps
   */
  maxFiles?: number;
  /**
   * Maximum file size allowed (in bytes). Defaults to REACT_APP_MAX_FILE_SIZE or 52428800 (50MB).
   *
   * @type {number}
   * @memberof IFileUploadProps
   */
  maxFileSize?: number;
}

export const DropZone: React.FC<IFileUploadProps> = (props) => {
  const classes = useStyles();

  return (
    <Dropzone
      maxFiles={props.maxFiles || MAX_FILES}
      maxSize={props.maxFileSize || MAX_FILE_SIZE_BYTES}
      onDrop={props.onFiles}>
      {({ getRootProps, getInputProps }) => (
        <section>
          <Box {...getRootProps()}>
            <input {...getInputProps()} data-testid="drop-zone-input" />
            <Box m={3} display="flex" flexDirection="column" alignItems="center">
              <Icon path={mdiTrayPlus} size={1} />
              <Typography>
                Drag your files here, or <Link className={classes.browseLink}>Browse Files</Link>
              </Typography>
              <Typography>{`Maximum file size: ${MAX_FILE_SIZE_MEGABYTES} MB`}</Typography>
              <Typography>{`Maximum file count: ${MAX_FILES}`}</Typography>
            </Box>
          </Box>
        </section>
      )}
    </Dropzone>
  );
};

export default DropZone;
