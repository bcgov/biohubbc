import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { AccessStatusChip } from 'components/chips/RequestChips';
import RequestDialog from 'components/dialog/RequestDialog';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { ReviewAccessRequestI18N } from 'constants/i18n';
import { AdministrativeActivityStatusType } from 'constants/misc';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import {
  IgcNotifyGenericMessage,
  IgcNotifyRecipient,
  IGetAccessRequestsListResponse
} from 'interfaces/useAdminApi.interface';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import React, { useContext, useState } from 'react';
import { getFormattedDate } from 'utils/Utils';
import ReviewAccessRequestForm, {
  IReviewAccessRequestForm,
  ReviewAccessRequestFormInitialValues,
  ReviewAccessRequestFormYupSchema
} from './ReviewAccessRequestForm';

const useStyles = makeStyles(() => ({
  table: {
    tableLayout: 'fixed',
    '& td': {
      verticalAlign: 'middle'
    }
  }
}));

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

  const classes = useStyles();
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

  const handleReviewDialogApprove = async (values: IReviewAccessRequestForm) => {
    const updatedRequest = activeReviewDialog.request as IGetAccessRequestsListResponse;

    setActiveReviewDialog({ open: false, request: null });

    try {
      await biohubApi.admin.sendGCNotification(
        {
          emailAddress: updatedRequest.data.email,
          userId: updatedRequest.id
        } as IgcNotifyRecipient,
        {
          subject: 'SIMS: Your request for access has been approved.',
          header: 'Your request for access to the Species Inventory Management System has been approved.',
          body1: 'This is an automated message from the BioHub Species Inventory Management System',
          body2: '',
          footer: ''
        } as IgcNotifyGenericMessage
      );
    } catch (error) {
      dialogContext.setErrorDialog({
        ...defaultErrorDialogProps,
        open: true,
        dialogErrorDetails: (error as APIError).errors
      });
    }

    try {
      await biohubApi.admin.approveAccessRequest(
        updatedRequest.id,
        updatedRequest.data.username,
        updatedRequest.data.identitySource,
        (values.system_role && [values.system_role]) || []
      );

      refresh();
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
      await biohubApi.admin.sendGCNotification(
        {
          emailAddress: updatedRequest.data.email,
          userId: updatedRequest.id
        } as IgcNotifyRecipient,
        {
          subject: 'SIMS: Your request for access has been denied.',
          header: 'Your request for access to the Species Inventory Management System has been denied.',
          body1: 'This is an automated message from the BioHub Species Inventory Management System',
          body2: '',
          footer: ''
        } as IgcNotifyGenericMessage
      );
    } catch (error) {
      dialogContext.setErrorDialog({
        ...defaultErrorDialogProps,
        open: true,
        dialogErrorDetails: (error as APIError).errors
      });
    }

    try {
      await biohubApi.admin.denyAccessRequest(updatedRequest.id);

      refresh();
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
      <Paper>
        <Toolbar disableGutters>
          <Box px={2}>
            <Typography variant="h2">Access Requests ({accessRequests?.length || 0})</Typography>
          </Box>
        </Toolbar>
        <TableContainer>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Date of Request</TableCell>
                <TableCell>Access Status</TableCell>
                <TableCell width="130px" align="center">
                  Actions
                </TableCell>
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

                    <TableCell align="center">
                      {row.status_name === AdministrativeActivityStatusType.PENDING && (
                        <Button
                          color="primary"
                          variant="outlined"
                          onClick={() => setActiveReviewDialog({ open: true, request: row })}>
                          <strong>Review</strong>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
};

export default AccessRequestList;
