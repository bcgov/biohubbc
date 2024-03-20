import { mdiFileOutline, mdiLockOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { GridColDef } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { PublishStatus } from 'constants/attachments';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { ProjectAuthStateContext } from 'contexts/projectAuthStateContext';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import { IGetSurveyAttachment } from 'interfaces/useSurveyApi.interface';
import { useContext } from 'react';
import AttachmentsListItemMenuButton from './AttachmentsListItemMenuButton';

export interface IAttachmentsListProps<T extends IGetProjectAttachment | IGetSurveyAttachment> {
  attachments: T[];
  handleDownload: (attachment: T) => void;
  handleDelete: (attachment: T) => void;
  handleViewDetails: (attachment: T) => void;
  handleRemoveOrResubmit: (attachment: T) => void;
  emptyStateText?: string;
}

const validProjectPermissions: PROJECT_PERMISSION[] = [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR];

const validSystemRoles: SYSTEM_ROLE[] = [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR];

const pageSizeOptions = [5, 10, 25];

const AttachmentsList = <T extends IGetProjectAttachment | IGetSurveyAttachment>(props: IAttachmentsListProps<T>) => {
  const { attachments, handleDownload, handleDelete, handleViewDetails, handleRemoveOrResubmit } = props;

  const projectAuthStateContext = useContext(ProjectAuthStateContext);

  const hasSystemRole = projectAuthStateContext.hasSystemRole(validSystemRoles);
  const hasProjectPermissions = projectAuthStateContext.hasProjectPermission(validProjectPermissions);
  const showTableActions = hasSystemRole || hasProjectPermissions;

  const attachmentsListColumnDefs: GridColDef<T>[] = [
    {
      field: 'fileName',
      headerName: 'Name',
      flex: 1,
      disableColumnMenu: true,
      renderCell: (params) => {
        const attachmentStatus = params.row.supplementaryAttachmentData?.event_timestamp
          ? PublishStatus.SUBMITTED
          : PublishStatus.UNSUBMITTED;

        const icon: string = attachmentStatus === PublishStatus.SUBMITTED ? mdiLockOutline : mdiFileOutline;

        return (
          <Stack
            flexDirection="row"
            alignItems="center"
            gap={2}
            sx={{
              '& svg': {
                color: '#1a5a96'
              },
              '& a': {
                fontWeight: 700
              }
            }}>
            <Icon path={icon} size={1} />
            <Link underline="always" onClick={() => handleDownload(params.row)} tabIndex={0}>
              {params.value}
            </Link>
          </Stack>
        );
      }
    },
    {
      field: 'fileType',
      flex: 1,
      headerName: 'Type',
      disableColumnMenu: true
    },
    {
      field: 'actions',
      headerName: '',
      type: 'actions',
      width: 70,
      sortable: false,
      disableColumnMenu: true,
      resizable: false,
      renderCell: (params) => {
        const attachmentStatus = params.row.supplementaryAttachmentData?.event_timestamp
          ? PublishStatus.SUBMITTED
          : PublishStatus.UNSUBMITTED;

        return (
          <AttachmentsListItemMenuButton
            attachmentFileType={params.row.fileType}
            attachmentStatus={attachmentStatus}
            onDownloadFile={() => handleDownload(params.row)}
            onDeleteFile={() => handleDelete(params.row)}
            onViewDetails={() => handleViewDetails(params.row)}
            onRemoveOrResubmit={() => handleRemoveOrResubmit(params.row)}
          />
        );
      }
    }
  ];

  return (
    <StyledDataGrid<T>
      noRowsMessage={props.emptyStateText ?? 'No Attachments'}
      columns={attachmentsListColumnDefs}
      rows={attachments}
      pageSizeOptions={pageSizeOptions}
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 5
          }
        },
        columns: {
          columnVisibilityModel: {
            actions: showTableActions
          }
        }
      }}
    />
  );
};

export default AttachmentsList;
