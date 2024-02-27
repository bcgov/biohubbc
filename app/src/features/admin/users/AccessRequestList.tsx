import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { AccessStatusChip } from 'components/chips/AccessStatusChip';
import RequestDialog from 'components/dialog/RequestDialog';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { AccessApprovalDispatchI18N, AccessDenialDispatchI18N, ReviewAccessRequestI18N } from 'constants/i18n';
import { AdministrativeActivityStatusType } from 'constants/misc';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAccessRequestsListResponse } from 'interfaces/useAdminApi.interface';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import React, { useContext, useState } from 'react';
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

/**
 * Page to display a list of user access.
 *
 * @param {*} props
 * @return {*}
 */
const AccessRequestList: React.FC<IAccessRequestListProps> = (props) => {
  const { accessRequests, codes, refresh } = props;

  const biohubApi = useBiohubApi();

  const [activeReviewDialog, setActiveReviewDialog] = useState<{
    open: boolean;
    request: IGetAccessRequestsListResponse | any;
  }>({
    open: false,
    request: null
  });

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

  const handleReviewDialogApprove = async (values: IReviewAccessRequestForm) => {
    const updatedRequest = activeReviewDialog.request as IGetAccessRequestsListResponse;

    setActiveReviewDialog({ open: false, request: null });

    try {
      await biohubApi.admin.approveAccessRequest(updatedRequest.id, {
        userGuid: updatedRequest.data.userGuid,
        userIdentifier: updatedRequest.data.username,
        identitySource: updatedRequest.data.identitySource,
        email: updatedRequest.data.email,
        displayName: updatedRequest.data.displayName,
        roleIds: (values.system_role && [values.system_role]) || []
      });

      try {
        await biohubApi.admin.sendGCNotification(
          {
            emailAddress: updatedRequest.data.email,
            phoneNumber: '',
            userId: updatedRequest.id
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
    const updatedRequest = activeReviewDialog.request as IGetAccessRequestsListResponse;

    setActiveReviewDialog({ open: false, request: null });

    try {
      await biohubApi.admin.denyAccessRequest(updatedRequest.id);

      try {
        await biohubApi.admin.sendGCNotification(
          {
            emailAddress: updatedRequest.data.email,
            phoneNumber: '',
            userId: updatedRequest.id
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
        open={activeReviewDialog.open}
        onClose={() => setActiveReviewDialog({ open: false, request: null })}
        onDeny={handleReviewDialogDeny}
        onApprove={handleReviewDialogApprove}
        component={{
          initialValues: {
            ...ReviewAccessRequestFormInitialValues,
            system_role: activeReviewDialog.request?.data?.role
          },
          validationSchema: ReviewAccessRequestFormYupSchema,
          element: (
            <ReviewAccessRequestForm
              request={activeReviewDialog.request}
              system_roles={
                codes?.system_roles?.map((item) => {
                  return { value: item.id, label: item.name };
                }) || []
              }
            />
          )
        }}
      />
      <Paper elevation={0}>
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
        <Box p={1}>
          <TableContainer>
            <Table
              sx={{
                tableLayout: 'fixed'
              }}>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Date of Request</TableCell>
                  <TableCell width={170}>Status</TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody data-testid="access-request-table">
                {!accessRequests?.length && (
                  <TableRow data-testid={'access-request-row-0'}>
                    <TableCell colSpan={4} align="center">
                      No Access Requests
                    </TableCell>
                  </TableRow>
                )}
                {accessRequests?.map((row, index) => {
                  return (
                    <TableRow data-testid={`access-request-row-${index}`} key={index}>
                      <TableCell>{row.data?.username || ''}</TableCell>
                      <TableCell>{getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.create_date)}</TableCell>
                      <TableCell>
                        <AccessStatusChip status={row.status_name} />
                      </TableCell>

                      <TableCell align="right">
                        {row.status_name === AdministrativeActivityStatusType.PENDING && (
                          <Button
                            color="primary"
                            variant="contained"
                            onClick={() => setActiveReviewDialog({ open: true, request: row })}>
                            Review Request
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    </>
  );
};

export default AccessRequestList;
