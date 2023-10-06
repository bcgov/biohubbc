import { mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { ConfigContext } from 'contexts/configContext';
import React, { useContext } from 'react';
import Dropzone, { FileRejection } from 'react-dropzone';

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
  /**
   * Allow selecting multiple files while browsing.
   * Default: true
   *
   * Note: Does not impact drag/drop.
   *
   * @type {boolean}
   * @memberof IDropZoneProps
   */
  multiple?: boolean;
  /**
   * Comma separated list of allowed file extensions.
   *
   * Example: `'.pdf, .txt'`
   *
   * @type {string}
   * @memberof IDropZoneConfigProps
   */
  acceptedFileExtensions?: string;
}

export const DropZone: React.FC<IDropZoneProps & IDropZoneConfigProps> = (props) => {
  const config = useContext(ConfigContext);

  const maxNumFiles = props.maxNumFiles || config?.MAX_UPLOAD_NUM_FILES;
  const maxFileSize = props.maxFileSize || config?.MAX_UPLOAD_FILE_SIZE;
  const multiple = props.multiple ?? true;
  const acceptedFileExtensions = props.acceptedFileExtensions;

  return (
    <Box className="dropZoneContainer">
      <Dropzone
        maxFiles={maxNumFiles}
        maxSize={maxFileSize}
        multiple={multiple}
        onDrop={props.onFiles}
        accept={props.acceptedFileExtensions}>
        {({ getRootProps, getInputProps }) => (
          <Box {...getRootProps()}>
            <input {...getInputProps()} data-testid="drop-zone-input" />
            <Box p={3} display="flex" flexDirection="column" alignItems="center">
              <Box mb={1}>
                <Icon path={mdiTrayArrowUp} size={1.25} />
              </Box>
              <Box
                data-testid="dropzone-instruction-text"
                mb={0.5}
                sx={{
                  fontSize: '1.125rem',
                  fontWeight: 700
                }}>
                Drag your {(multiple && 'files') || 'file'} here, or <Link underline="always">Browse Files</Link>
              </Box>
              <Box textAlign="center">
                {acceptedFileExtensions && (
                  <Typography
                    component="span"
                    variant="subtitle2"
                    color="textSecondary"
                    sx={{
                      mx: 1
                    }}>
                    {`Supported files: ${acceptedFileExtensions}`}
                  </Typography>
                )}
                {!!maxFileSize && maxFileSize !== Infinity && (
                  <Typography
                    component="span"
                    variant="subtitle2"
                    color="textSecondary"
                    data-testid="dropzone-max-size-text"
                    sx={{
                      mx: 1
                    }}>
                    {`Maximum size: ${Math.round(maxFileSize / BYTES_PER_MEGABYTE)} MB`}
                  </Typography>
                )}
                {!!maxNumFiles && (
                  <Typography
                    component="span"
                    variant="subtitle2"
                    color="textSecondary"
                    data-testid="dropzone-max-files-text"
                    sx={{
                      mx: 1
                    }}>
                    {`Maximum files: ${maxNumFiles}`}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Dropzone>
    </Box>
  );
};

export default DropZone;
