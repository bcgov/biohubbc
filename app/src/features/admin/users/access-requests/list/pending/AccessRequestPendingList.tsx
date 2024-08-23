import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { GridColDef } from '@mui/x-data-grid';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import RequestDialog from 'components/dialog/RequestDialog';
import { getAccessRequestStatusColour } from 'constants/colours';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { ReviewAccessRequestI18N } from 'constants/i18n';
import { DialogContext, ISnackbarProps } from 'contexts/dialogContext';
import dayjs from 'dayjs';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAccessRequestsListResponse } from 'interfaces/useAdminApi.interface';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { useContext, useState } from 'react';
import ReviewAccessRequestForm, {
  IReviewAccessRequestForm,
  ReviewAccessRequestFormInitialValues,
  ReviewAccessRequestFormYupSchema
} from '../../components/ReviewAccessRequestForm';

interface IAccessRequestPendingListProps {
  accessRequests: IGetAccessRequestsListResponse[];
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * Returns a data grid component displaying pending access requests
 *
 * @param props {IAccessRequestPendingListProps}
 * @returns
 */
const AccessRequestPendingList = (props: IAccessRequestPendingListProps) => {
  const { accessRequests, codes, refresh } = props;

  const biohubApi = useBiohubApi();
  const dialogContext = useContext(DialogContext);

  const [showReviewDialog, setShowReviewDialog] = useState<boolean>(false);
  const [activeReview, setActiveReview] = useState<IGetAccessRequestsListResponse | null>(null);

  const showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
  };

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
            label={params.row.status_name}
            colour={getAccessRequestStatusColour(params.row.status_name as 'Pending')}
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
            setShowReviewDialog(true);
          }}>
          Review Request
        </Button>
      )
    }
  ];

  const defaultErrorDialogProps = {
    dialogTitle: ReviewAccessRequestI18N.reviewErrorTitle,
    dialogText: ReviewAccessRequestI18N.reviewErrorText,
    open: false,
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const handleReviewDialogApprove = async (values: IReviewAccessRequestForm) => {
    if (!activeReview) {
      return;
    }

    setShowReviewDialog(false);

    try {
      await biohubApi.admin.approveAccessRequest(activeReview.id, {
        userGuid: activeReview.data.userGuid,
        userIdentifier: activeReview.data.username,
        identitySource: activeReview.data.identitySource,
        email: activeReview.data.email,
        displayName: activeReview.data.displayName,
        roleIds: (values.system_role && [values.system_role]) || []
      });

      showSnackBar({
        snackbarMessage: (
          <Typography variant="body2" component="div">
            Approved access request
          </Typography>
        )
      });

      try {
        await biohubApi.admin.sendGCNotification(
          {
            emailAddress: activeReview.data.email,
            phoneNumber: '',
            userId: activeReview.id
          },
          {
            subject: 'SIMS: Your request for access has been approved.',
            header: 'Your request for access to the Species Inventory Management System has been approved.',
            main_body1: 'This is an automated message from the Species Inventory Management System',
            main_body2: '',
            footer: ''
          }
        );
      } catch (error) {
        showSnackBar({
          snackbarMessage: (
            <Typography variant="body2" component="div">
              Approved access request, but failed to email notification
            </Typography>
          )
        });
      } finally {
        refresh();
      }
    } catch (error) {
      dialogContext.setErrorDialog({
        ...defaultErrorDialogProps,
        open: true,
        dialogErrorDetails: (error as APIError).errors
      });
    }
  };

  const handleReviewDialogDeny = async () => {
    if (!activeReview) {
      return;
    }

    setShowReviewDialog(false);

    try {
      await biohubApi.admin.denyAccessRequest(activeReview.id);

      showSnackBar({
        snackbarMessage: (
          <Typography variant="body2" component="div">
            Approved access request
          </Typography>
        )
      });

      try {
        await biohubApi.admin.sendGCNotification(
          {
            emailAddress: activeReview.data.email,
            phoneNumber: '',
            userId: activeReview.id
          },
          {
            subject: 'SIMS: Your request for access has been denied.',
            header: 'Your request for access to the Species Inventory Management System has been denied.',
            main_body1: 'This is an automated message from the Species Inventory Management System',
            main_body2: '',
            footer: ''
          }
        );
      } catch (error) {
        showSnackBar({
          snackbarMessage: (
            <Typography variant="body2" component="div">
              Denied access request, but failed to email notification
            </Typography>
          )
        });
      } finally {
        refresh();
      }
    } catch (error) {
      dialogContext.setErrorDialog({
        ...defaultErrorDialogProps,
        open: true,
        dialogErrorDetails: (error as APIError).errors
      });
    }
  };

  return (
    <>
      <RequestDialog
        dialogTitle={'Review Access Request'}
        open={showReviewDialog}
        onClose={() => setShowReviewDialog(false)}
        onDeny={handleReviewDialogDeny}
        onApprove={handleReviewDialogApprove}
        component={{
          initialValues: ReviewAccessRequestFormInitialValues,
          validationSchema: ReviewAccessRequestFormYupSchema,
          element: activeReview ? (
            <ReviewAccessRequestForm
              request={activeReview}
              system_roles={codes?.system_roles?.map((item: any) => ({ value: item.id, label: item.name })) || []}
            />
          ) : (
            <></>
          )
        }}
      />
      <StyledDataGrid
        columns={accessRequestsColumnDefs}
        rows={accessRequests}
        noRowsMessage="No Pending Access Requests"
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

export default AccessRequestPendingList;
