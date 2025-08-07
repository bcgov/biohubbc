import { GridColDef } from '@mui/x-data-grid';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { getAccessRequestStatusColour } from 'constants/colours';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { IGetAccessRequestsListResponse } from 'interfaces/useAdminApi.interface';

interface IAccessRequestInvitedListProps {
  accessRequests: IGetAccessRequestsListResponse[];
  refresh: () => void;
}

/**
 * Returns a data grid component displaying invited access requests
 *
 * @param props {IAccessRequestInvitedListProps}
 * @returns
 */
const AccessRequestInvitedList = (props: IAccessRequestInvitedListProps) => {
  const { accessRequests } = props;

  const accessRequestsColumnDefs: GridColDef<IGetAccessRequestsListResponse>[] = [
    {
      field: 'display_name',
      headerName: 'Display Name',
      flex: 1,
      disableColumnMenu: true,
      valueGetter: (params) => {
        return params.row.data?.displayName;
      }
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      disableColumnMenu: true,
      valueGetter: (params) => {
        return params.row.data?.email;
      }
    },
    {
      field: 'create_date',
      flex: 1,
      headerName: 'Date Invited',
      disableColumnMenu: true,
      valueFormatter: (params) => {
        return dayjs(params.value).format(DATE_FORMAT.ShortMediumDateTimeFormat);
      }
    },
    {
      field: 'status_name',
      width: 170,
      headerName: 'Status',
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <ColouredRectangleChip
            label={params.row.status_name}
            colour={getAccessRequestStatusColour(params.row.status_name as 'Invited')}
          />
        );
      }
    }
  ];

  return (
    <StyledDataGrid
      columns={accessRequestsColumnDefs}
      rows={accessRequests}
      noRowsMessage="No Invited Access Requests"
      pageSizeOptions={[10, 25, 50]}
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 10
          }
        }
      }}
    />
  );
};

export default AccessRequestInvitedList;
