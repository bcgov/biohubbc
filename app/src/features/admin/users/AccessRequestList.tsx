import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { GridColDef } from '@mui/x-data-grid';
import { AccessStatusChip } from 'components/chips/AccessStatusChip';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import RequestDialog from 'components/dialog/RequestDialog';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { AccessApprovalDispatchI18N, AccessDenialDispatchI18N, ReviewAccessRequestI18N } from 'constants/i18n';
import { AdministrativeActivityStatusType } from 'constants/misc';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAccessRequestsListResponse } from 'interfaces/useAdminApi.interface';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { useContext, useState } from 'react';
import { getFormattedDate } from 'utils/Utils';
import ReviewAccessRequestForm, {
  IReviewAccessRequestForm,
  ReviewAccessRequestFormInitialValues,
  ReviewAccessRequestFormYupSchema
} from './ReviewAccessRequestForm';

export interface IAccessRequestListProps {
  accessRequests: IGetAccessRequestsListResponse[];
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

const pageSizeOptions = [10, 25, 50];

/**
 * Page to display a list of user access.
 *
 */
const AccessRequestList = (props: IAccessRequestListProps) => {
  const { accessRequests, codes, refresh } = props;

  const biohubApi = useBiohubApi();

  const [showReviewDialog, setShowReviewDialog] = useState<boolean>(false);
  const [activeReview, setActiveReview] = useState<IGetAccessRequestsListResponse | null>(null);

  const dialogContext = useContext(DialogContext);

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

  const dispatchApprovalErrorDialogProps = {
    dialogTitle: AccessApprovalDispatchI18N.reviewErrorTitle,
    dialogText: AccessApprovalDispatchI18N.reviewErrorText,
    open: false,
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const dispatchDenialErrorDialogProps = {
    dialogTitle: AccessDenialDispatchI18N.reviewErrorTitle,
    dialogText: AccessDenialDispatchI18N.reviewErrorText,
    open: false,
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const accessRequestsColumnDefs: GridColDef<IGetAccessRequestsListResponse>[] = [
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
        return getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, params.value);
      }
    },
    {
      field: 'status_name',
      width: 170,
      headerName: 'Status',
      disableColumnMenu: true,
      renderCell: (params) => {
        return <AccessStatusChip status={params.row.status_name} />;
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
      renderCell: (params) => {
        if (params.row.status_name !== AdministrativeActivityStatusType.PENDING) {
          return <></>;
        }

        return (
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              setActiveReview(params.row);
              setShowReviewDialog(true);
            }}>
            Review Request
          </Button>
        );
      }
    }
  ];

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
            main_body1: 'This is an automated message from the BioHub Species Inventory Management System',
            main_body2: '',
            footer: ''
          }
        );
      } catch (error) {
        dialogContext.setErrorDialog({
          ...dispatchApprovalErrorDialogProps,
          open: true,
          dialogErrorDetails: (error as APIError).errors
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
            main_body1: 'This is an automated message from the BioHub Species Inventory Management System',
            main_body2: '',
            footer: ''
          }
        );
      } catch (error) {
        dialogContext.setErrorDialog({
          ...dispatchDenialErrorDialogProps,
          open: true,
          dialogErrorDetails: (error as APIError).errors
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
              system_roles={
                codes?.system_roles?.map((item) => {
                  return { value: item.id, label: item.name };
                }) || []
              }
            />
          ) : (
            <></>
          )
        }}
      />
      <Paper>
        <Toolbar>
          <Typography variant="h4" component="h2">
            Access Requests{' '}
            <Typography
              component="span"
              variant="inherit"
              color="textSecondary"
              sx={{
                fontWeight: 400
              }}>
              ({Number(accessRequests?.length ?? 0).toLocaleString()})
            </Typography>
          </Typography>
        </Toolbar>
        <Divider></Divider>
        <Box p={2}>
          <StyledDataGrid
            columns={accessRequestsColumnDefs}
            rows={accessRequests}
            noRowsMessage="No Access Requests"
            pageSizeOptions={pageSizeOptions}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10
                }
              }
            }}
          />
        </Box>
      </Paper>
    </>
  );
};

export default AccessRequestList;
