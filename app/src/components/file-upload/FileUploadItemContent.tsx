import { mdiFileOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import FileUploadItemErrorDetails from 'components/file-upload/FileUploadItemErrorDetails';
import { IFileUploadItemProps, UploadFileStatus } from './FileUploadItem';
import FileUploadItemActionButton from './FileUploadItemActionButton';
import FileUploadItemProgressBar from './FileUploadItemProgressBar';
import FileUploadItemSubtext from './FileUploadItemSubtext';

type FileUploadItemContentProps = Omit<IFileUploadItemProps, 'uploadHandler' | 'onSuccess' | 'fileHandler'> & {
  /**
   * The file upload status.
   *
   * @type {UploadFileStatus}
   * @memberof FileUploadItemContentProps
   */
  status: UploadFileStatus;
  /**
   * The progress of the file upload.
   *
   * @type {number}
   * @memberof FileUploadItemContentProps
   */
  progress: number;
  /**
   * Additional error details.
   *
   * @type {Array<{ _id: string; message: string }>}
   * @memberof FileUploadItemContentProps
   */
  errorDetails?: Array<{ _id: string; message: string }>;
};

/**
 * File upload item content. The UI layout of a file upload item.
 *
 * @param {FileUploadItemContentProps} props
 * @returns {*}
 */
export const FileUploadItemContent = (props: FileUploadItemContentProps) => {
  /**
   * Sensible defaults for the subtext, action button, and progress bar components.
   *
   **/
  const Subtext = props.SubtextComponent ?? FileUploadItemSubtext;
  const ActionButton = props.ActionButtonComponent ?? FileUploadItemActionButton;
  const ProgressBar = props.ProgressBarComponent ?? FileUploadItemProgressBar;

  return (
    <ListItem
      key={props.file.name}
      secondaryAction={<ActionButton status={props.status} onCancel={props.onCancel} />}
      sx={{
        flexWrap: 'wrap',
        borderStyle: 'solid',
        borderWidth: '1px',
        borderRadius: '6px',
        background: grey[100],
        borderColor: grey[300],
        '& + li': {
          mt: 1
        },
        '& .MuiListItemSecondaryAction-root': {
          top: '36px'
        },
        '&:last-child': {
          borderBottomStyle: 'solid',
          borderBottomWidth: '1px',
          borderBottomColor: grey[300]
        }
      }}>
      <ListItemIcon>
        <Icon
          path={mdiFileOutline}
          size={1.25}
          style={props.error ? { color: 'error.main' } : { color: 'text.secondary' }}
        />
      </ListItemIcon>
      <ListItemText
        primary={props.file.name}
        secondary={<Subtext file={props.file} status={props.status} progress={props.progress} error={props.error} />}
        sx={{
          '& .MuiListItemText-primary': {
            fontWeight: 700
          }
        }}
      />

      <Box
        sx={{
          ml: 5,
          width: '100%',
          '& .MuiLinearProgress-root': {
            mb: 1
          }
        }}>
        <ProgressBar status={props.status} progress={props.progress} />
      </Box>
      {props.enableErrorDetails && (
        <Box sx={{ mt: 1, ml: 5, width: '100%' }}>
          <FileUploadItemErrorDetails error={props.error} errorDetails={props.errorDetails} />
        </Box>
      )}
    </ListItem>
  );
};
