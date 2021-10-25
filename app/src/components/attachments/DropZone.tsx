import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { mdiUpload } from '@mdi/js';
import Icon from '@mdi/react';
import React, { useContext } from 'react';
import Dropzone, { FileRejection } from 'react-dropzone';
import { ConfigContext } from 'contexts/configContext';
import { Theme } from '@material-ui/core/styles/createMuiTheme';

const useStyles = makeStyles((theme: Theme) => ({
  dropZoneContainer: {
    margin: '-4px',
    borderRadius: '4px',
    borderStyle: 'dashed',
    borderWidth: '2px',
    borderColor: theme.palette.text.disabled,
    background: '#ffffff',
    cursor: 'pointer',
    '&:hover, &:focus': {
      borderColor: theme.palette.primary.main,
      transition: 'all ease-out 0.2s'
    }
  },
  dropZoneTitle: {
    marginBottom: theme.spacing(1),
    fontSize: '1.125rem',
    fontWeight: 700
  },
  dropZoneIcon: {
    color: theme.palette.text.disabled
  },
  dropZoneRequirements: {
    textAlign: 'center'
  }
}));

const BYTES_PER_MEGABYTE = 1048576;

export interface IDropZoneProps {
  /**
   * Function called when files are accepted/rejected (via either drag/drop or browsing).
   *
   * Note: Files may be rejected due of file size limits or file number limits
   *
   * @memberof IDropZoneProps
   */
  onFiles: (acceptedFiles: File[], rejectedFiles: FileRejection[]) => void;
}

export interface IDropZoneConfigProps {
  /**
   * Maximum file size allowed (in bytes).
   *
   * @type {number}
   * @memberof IDropZoneProps
   */
  maxFileSize?: number;
  /**
   * Maximum number of files allowed.
   *
   * @type {number}
   * @memberof IDropZoneProps
   */
  maxNumFiles?: number;

  acceptedFileExtensions?: string;
}

export const DropZone: React.FC<IDropZoneProps & IDropZoneConfigProps> = (props) => {
  const classes = useStyles();
  const config = useContext(ConfigContext);

  const maxNumFiles = props.maxNumFiles || config?.MAX_UPLOAD_NUM_FILES;
  const maxFileSize = props.maxFileSize || config?.MAX_UPLOAD_FILE_SIZE;
  const acceptedFileExtensions = props.acceptedFileExtensions;

  return (
    <Box className="dropZoneContainer">
      <Dropzone
        maxFiles={maxNumFiles}
        maxSize={maxFileSize}
        onDrop={props.onFiles}
        accept={props.acceptedFileExtensions}>
        {({ getRootProps, getInputProps }) => (
          <Box {...getRootProps({ className: classes.dropZoneContainer })}>
            <input {...getInputProps()} data-testid="drop-zone-input" />
            <Box m={2} display="flex" flexDirection="column" alignItems="center">
              <Icon className={classes.dropZoneIcon} path={mdiUpload} size={1.5} />
              <Box mt={0.5} className={classes.dropZoneTitle}>
                Drag your files here, or <Link underline="always">Browse Files</Link>
              </Box>
              <Box textAlign="center">
                <Box mb={0.5}>
                  {acceptedFileExtensions && (
                    <Typography component="span" variant="body2" color="textSecondary">
                      {`Accepted file types: ${acceptedFileExtensions}`}
                    </Typography>
                  )}
                </Box>
                <Box>
                  {!!maxFileSize && maxFileSize !== Infinity && (
                    <Typography component="span" variant="body2" color="textSecondary">
                      {`Maximum file size: ${Math.round(maxFileSize / BYTES_PER_MEGABYTE)} MB`}
                    </Typography>
                  )}
                  {!!maxNumFiles && (
                    <Typography component="span" variant="body2" color="textSecondary">
                      &nbsp;|&nbsp;{`Maximum file count: ${maxNumFiles}`}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Dropzone>
    </Box>
  );
};

export default DropZone;
