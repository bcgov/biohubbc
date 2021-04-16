import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { mdiUploadOutline } from '@mdi/js';
import Icon from '@mdi/react';
import React from 'react';
import Dropzone, { FileRejection } from 'react-dropzone';

const useStyles = makeStyles(() => ({
  textSpacing: {
    marginBottom: '1rem'
  },
  browseLink: {
    cursor: 'pointer'
  }
}));

const MAX_NUM_FILES = Number(process.env.REACT_APP_MAX_UPLOAD_NUM_FILES) || 10;
const MAX_FILE_SIZE_BYTES = Number(process.env.REACT_APP_MAX_UPLOAD_FILE_SIZE) || 52428800;

const BYTES_PER_MEGABYTE = 1048576;

export interface IFileUploadProps {
  /**
   * Project ID.
   *
   * @type {number}
   * @memberof IFileUploadProps
   */
  projectId: number;
  /**
   * Function called when files are accepted/rejected (via either drag/drop or browsing).
   *
   * Note: Files may be rejected due of file size limits or file number limits
   *
   * @memberof IFileUploadProps
   */
  onFiles: (acceptedFiles: File[], rejectedFiles: FileRejection[]) => void;
  /**
   * Maximum file size allowed (in bytes).
   *
   * Note: defaults to `process.env.REACT_APP_MAX_UPLOAD_FILE_SIZE` or `52428800` if not provided
   * Note: Set to `Infinity` if no size limit is needed.
   *
   * @type {number}
   * @memberof IFileUploadProps
   */
  maxFileSize?: number;
  /**
   * Maximum number of files allowed.
   *
   * Note: defaults to `process.env.REACT_APP_MAX_UPLOAD_NUM_FILES` or `10` if not provided
   * Note: Set to `0` if no file number limit is needed.
   *
   * @type {number}
   * @memberof IFileUploadProps
   */
  maxNumFiles?: number;
}

export const DropZone: React.FC<IFileUploadProps> = (props) => {
  const classes = useStyles();

  const maxNumFiles = props.maxNumFiles || MAX_NUM_FILES;
  const maxFileSize = props.maxFileSize || MAX_FILE_SIZE_BYTES;

  return (
    <Dropzone maxFiles={maxNumFiles} maxSize={maxFileSize} onDrop={props.onFiles}>
      {({ getRootProps, getInputProps }) => (
        <section>
          <Box {...getRootProps()}>
            <input {...getInputProps()} data-testid="drop-zone-input" />
            <Box m={3} display="flex" flexDirection="column" alignItems="center">
              <Icon path={mdiUploadOutline} size={2} className={classes.textSpacing} />
              <Typography variant="h3" className={classes.textSpacing}>
                Drag your files here, or <Link className={classes.browseLink}>Browse Files</Link>
              </Typography>
              {!!maxFileSize && maxFileSize !== Infinity && (
                <Typography component="span" variant="subtitle2" color="textSecondary">
                  {`Maximum file size: ${Math.round(maxFileSize / BYTES_PER_MEGABYTE)} MB`}
                </Typography>
              )}
              {!!maxNumFiles && (
                <Typography component="span" variant="subtitle2" color="textSecondary">
                  {`Maximum file count: ${maxNumFiles}`}
                </Typography>
              )}
            </Box>
          </Box>
        </section>
      )}
    </Dropzone>
  );
};

export default DropZone;
