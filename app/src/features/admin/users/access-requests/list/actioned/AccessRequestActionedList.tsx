import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { GridColDef } from '@mui/x-data-grid';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { getAccessRequestColour } from 'constants/colours';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { IGetAccessRequestsListResponse } from 'interfaces/useAdminApi.interface';
import { useState } from 'react';
import { ViewAccessRequestForm } from '../../components/ViewAccessRequestForm';

interface IAccessRequestActionedListProps {
  accessRequests: IGetAccessRequestsListResponse[];
}

const AccessRequestActionedList = (props: IAccessRequestActionedListProps) => {
  const { accessRequests } = props;

  const [showViewDialog, setShowViewDialog] = useState<boolean>(false);
  const [activeReview, setActiveReview] = useState<IGetAccessRequestsListResponse | null>(null);

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
      field: 'username',
      headerName: 'Username',
      flex: 1,
      disableColumnMenu: true,
      valueGetter: (params) => {
        return params.row.data?.username;
      }
    },
    {
      field: 'create_date',
      flex: 1,
      headerName: 'Date of Request',
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
            label="Approved"
            colour={getAccessRequestColour(params.row.status_name as 'Actioned')}
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: '',
      type: 'actions',
      flex: 1,
      sortable: false,
      disableColumnMenu: true,
      resizable: false,
      align: 'right',
      renderCell: (params) => (
        <Button
          color="primary"
          variant="contained"
          onClick={() => {
            setActiveReview(params.row);
            setShowViewDialog(true);
          }}>
          View
        </Button>
      )
    }
  ];

  return (
    <>
      {activeReview && (
        <Dialog open={showViewDialog} onClose={() => setShowViewDialog(false)}>
          <DialogTitle>Access Request</DialogTitle>
          <DialogContent>
            <ViewAccessRequestForm
              request={activeReview}
              bannerText={`Approved by ${activeReview.updated_by} on ${dayjs(activeReview.update_date).format(
                DATE_FORMAT.LongDateTimeFormat
              )}`}
            />
          </DialogContent>
        </Dialog>
      )}
      <StyledDataGrid
        columns={accessRequestsColumnDefs}
        rows={accessRequests}
        noRowsMessage="No Approved Access Requests"
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10
            }
          }
        }}
      />
    </>
  );
};

export default AccessRequestActionedList;
