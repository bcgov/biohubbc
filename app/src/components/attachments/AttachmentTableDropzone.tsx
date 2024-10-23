import { GridColDef } from '@mui/x-data-grid';
import AttachmentsListItemMenuButton from 'components/attachments/list/AttachmentsListItemMenuButton';
import { GenericFileNameColDef, GenericFileSizeColDef } from 'components/data-grid/GenericGridColumnDefinitions';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import FileUpload from 'components/file-upload/FileUpload';
import { UploadFileStatus } from 'components/file-upload/FileUploadItem';
import { PublishStatus } from 'constants/attachments';

interface IAttachment {
  /**
   * Attachment ID.
   *
   * @type {number}
   */
  id: number;
  /**
   * S3 key for the attachment.
   *
   * @type {string}
   */
  s3Key: string;
  /**
   * Attachment file name.
   *
   * @type {string}
   */
  name: string;
  /**
   * Attachment file size in bytes.
   *
   * @type {number}
   */
  size: number;
  /**
   * Attachment file type.
   *
   * @type {string}
   * @example 'Other', 'Report', 'Capture', 'Mortality', 'Cfg'
   */
  type: string;
}

interface IAttachmentTableDropzoneProps {
  /**
   * List of uploaded attachments to display in the table.
   *
   * @type {IAttachment[] | undefined}
   */
  attachments?: IAttachment[];
  /**
   * Callback to download an attachment.
   *
   * @param {(id: number, attachmentType: string) => void}
   */
  onDownloadAttachment: (id: number, attachmentType: string) => void;
  /**
   * Callback when a file is staged for upload.
   *
   * @param {(file: File | null) => void}
   */
  onStagedAttachment: (file: File | null) => void;
  /**
   * Callback when a staged attachment is removed.
   *
   * @param {(fileName: string) => void}
   */
  onRemoveStagedAttachment: (fileName: string) => void;
  /**
   * Callback when a previously uploaded attachment is removed.
   *
   * Note: Previously uploaded attachments exist in S3 and referenced in the database.
   *
   * @param {(id: number) => void}
   */
  onRemoveUploadedAttachment: (id: number) => void;
}

/**
 * AttachmentTableDropzone
 *
 * @description Renders a dropzone for staged attachements and a table of uploaded attachments.
 *
 * @param {IAnimalAttachmentsProps} props
 * @returns {*}
 */
export const AttachmentTableDropzone = (props: IAttachmentTableDropzoneProps): JSX.Element => {
  const attachmentsListColumnDefs: GridColDef<IAttachment>[] = [
    GenericFileNameColDef({
      field: 'name',
      headerName: 'Name',
      onClick: (params) => props.onDownloadAttachment(params.row.id, params.row.type)
    }),
    {
      field: 'type',
      flex: 1,
      headerName: 'Type',
      disableColumnMenu: true
    },
    GenericFileSizeColDef({ field: 'size', headerName: 'Size' }),
    {
      field: 'actions',
      headerName: '',
      type: 'actions',
      width: 70,
      sortable: false,
      disableColumnMenu: true,
      resizable: false,
      renderCell: (params) => {
        return (
          <AttachmentsListItemMenuButton
            attachmentFileType={params.row.type}
            attachmentStatus={PublishStatus.SUBMITTED}
            onDownloadFile={() => props.onDownloadAttachment(params.row.id, params.row.type)}
            onDeleteFile={() => props.onRemoveUploadedAttachment(params.row.id)}
            onViewDetails={() => undefined}
          />
        );
      }
    }
  ];
  return (
    <>
      <FileUpload
        fileHandler={props.onStagedAttachment}
        onRemove={props.onRemoveStagedAttachment}
        status={UploadFileStatus.STAGED}
      />

      {props.attachments && props.attachments.length > 0 && (
        <StyledDataGrid<IAttachment>
          noRowsMessage={'No Uploaded Attachments'}
          columns={attachmentsListColumnDefs}
          rows={props.attachments ?? []}
          pageSizeOptions={[5, 10, 20]}
          rowCount={props.attachments.length}
          disableRowSelectionOnClick
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5
              }
            }
          }}
        />
      )}
    </>
  );
};
