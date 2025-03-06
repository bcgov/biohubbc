import { grey } from '@mui/material/colors';
import { Box } from '@mui/system';
import DropZone, { IDropZoneConfigProps } from 'components/file-upload/DropZone';
import { UploadFileStatus } from 'components/file-upload/FileUploadItem';
import { FileUploadItemContent } from 'components/file-upload/FileUploadItemContent';
import { FileRejection } from 'react-dropzone';

type FileUploadSingleItemProps = {
  /**
   * The uploaded file via the dropzone.
   *
   * @type {File | null}
   * @memberof FileUploadSingleItemProps
   */
  file: File | null;
  /**
   * The status of the file upload.
   *
   * @type {UploadFileStatus}
   * @memberof FileUploadSingleItemProps
   */
  status: UploadFileStatus;
  /**
   * The error message of the file upload.
   *
   * @type {string}
   * @memberof FileUploadSingleItemProps
   */
  error?: string;
  /**
   * The progress of the file upload.
   *
   * @type {number}
   * @memberof FileUploadSingleItemProps
   */
  progress?: number;
  /**
   * Callback when file is uploaded via the dropzone.
   *
   * @type {(file: File | null) => void}
   * @memberof FileUploadSingleItemProps
   */
  onFile: (file: File | null) => void;
  /**
   * Optional callback to subscribe to the internal status changes.
   *
   * @type {(status: UploadFileStatus) => void}
   * @memberof FileUploadSingleItemProps
   */
  onStatus?: (status: UploadFileStatus) => void;
  /**
   * Optional callback to subscribe to the internal error changes.
   *
   * @type {(error: string) => void}
   * @memberof FileUploadSingleItemProps
   */
  onError?: (error: string) => void;
  /**
   * Optional callback when the user cancels the upload.
   *
   * @type {() => void}
   * @memberof FileUploadSingleItemProps
   */
  onCancel?: () => void;
  /**
   * Subset of Dropzone configuration props.
   *
   * @type {Pick<IDropZoneConfigProps, 'acceptedFileExtensions' | 'maxFileSize'>}
   * @memberof FileUploadSingleItemProps
   */
  DropZoneProps?: Pick<IDropZoneConfigProps, 'acceptedFileExtensions' | 'maxFileSize'>;
};

/**
 * `FileUploadSingleItem` a stateless component with full control of the file upload process via props.
 * Implements multiple callback functions to explictly handle events during the file upload.
 *
 * Note: This is different than the `FileUpload` component where the state is handled internally, and
 * supports multiple file uploads.
 *
 * @param {FileUploadSingleItemProps} props
 * @returns {*}
 */
export const FileUploadSingleItem = (props: FileUploadSingleItemProps) => {
  return (
    <>
      {props.file ? (
        <FileUploadItemContent
          file={props.file}
          error={props.error}
          status={props.status}
          onCancel={() => {
            props.onStatus?.(UploadFileStatus.PENDING);
            props.onFile(null);
            props.onCancel?.();
          }}
          progress={props.progress ?? 0}
        />
      ) : (
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
          <DropZone
            onFiles={(acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
              if (acceptedFiles.length) {
                props.onStatus?.(UploadFileStatus.STAGED);
                props.onFile(acceptedFiles[0]);
              } else {
                props.onStatus?.(UploadFileStatus.FAILED);
                props.onFile(null);
                props.onError?.(rejectedFiles[0].errors[0].message);
              }
            }}
            maxNumFiles={1}
            multiple={false}
            {...props.DropZoneProps}
          />
        </Box>
      )}
    </>
  );
};
