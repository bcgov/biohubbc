import DropZone from 'components/file-upload/DropZone';
import { UploadFileStatus } from 'components/file-upload/FileUploadItem';
import { FileUploadItemContent } from 'components/file-upload/FileUploadItemContent';
import { FileRejection } from 'react-dropzone';

type SingleFileUploadProps = {
  /*
   * The uploaded file via the dropzone.
   *
   **/
  file: File | null;
  /*
   * The status of the file upload.
   *
   **/
  status: UploadFileStatus;
  error?: string;
  progress?: number;
  /*
   * Callback to change the status of the file upload.
   *
   **/
  onChangeStatus: (status: UploadFileStatus) => void;
  /*
   * Callback to change the file once placed in the dropzone.
   *
   **/
  onFileDrop: (file: File | null) => void;
};

/**
 * `SingleFileUpload` with full control of the file upload process (status / file / progress).
 *
 * Note: The `file` and `status` are controlled by the parent component. This is different
 * than the `FileUpload` component where the state is handled internally.
 *
 * @param {SingleFileUploadProps} props
 * @returns {*}
 */
export const SingleFileUpload = (props: SingleFileUploadProps) => {
  return (
    <>
      {props.file ? (
        <FileUploadItemContent
          file={props.file}
          error={props.error}
          status={props.status}
          onCancel={() => {
            props.onChangeStatus(UploadFileStatus.PENDING);
            props.onFileDrop(null);
          }}
          progress={props.progress ?? 0}
        />
      ) : (
        <DropZone
          onFiles={(acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
            if (acceptedFiles.length) {
              props.onChangeStatus(UploadFileStatus.STAGED);
              props.onFileDrop(acceptedFiles[0]);
            } else {
              props.onChangeStatus(UploadFileStatus.FAILED);
              props.onFileDrop(rejectedFiles[0].file);
            }
          }}
          maxNumFiles={1}
          multiple={false}
          acceptedFileExtensions={'.csv'}
        />
      )}
    </>
  );
};
