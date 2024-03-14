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
          initialValues: {
            ...ReviewAccessRequestFormInitialValues,
            system_role: ''
          },
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
          ) : <></>
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
                            onClick={() => {
                              setActiveReview(row);
                              setShowReviewDialog(true);
                            }}>
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
