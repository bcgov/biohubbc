import { GridColDef } from '@mui/x-data-grid';
import AttachmentsListItemMenuButton from 'components/attachments/list/AttachmentsListItemMenuButton';
import { GenericFileNameColDef, GenericFileSizeColDef } from 'components/data-grid/GenericGridColumnDefinitions';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import FileUpload from 'components/file-upload/FileUpload';
import { UploadFileStatus } from 'components/file-upload/FileUploadItem';
import { PublishStatus } from 'constants/attachments';

interface IAttachment {
  id: number;
  s3Key: string;
  name: string;
  size: number;
  type: string;
}

interface IAnimalAttachmentsProps {
  attachments?: IAttachment[];
  onStagedAttachment: (file: File | null) => void;
  onRemoveStagedAttachment: (fileName: string, id?: number) => void;
  onRemoveUploadedAttachment: (id: number) => void;
}

/**
 * AnimalAttachments
 *
 * @param {IAnimalAttachmentsProps} props
 * @returns {*}
 */
export const AnimalAttachments = (props: IAnimalAttachmentsProps) => {
  const attachmentsListColumnDefs: GridColDef<IAttachment>[] = [
    GenericFileNameColDef({ field: 'name', headerName: 'Name' }),
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
            onDownloadFile={() => console.log('download')}
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
