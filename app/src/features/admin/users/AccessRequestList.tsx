import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import RequestDialog from 'components/dialog/RequestDialog';
import { DATE_FORMAT } from 'constants/dateFormats';
import { ReviewAccessRequestI18N } from 'constants/i18n';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAccessRequestsListResponse } from 'interfaces/useAdminApi.interface';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import React, { useEffect, useState } from 'react';
import { getFormattedDate } from 'utils/Utils';
import ReviewAccessRequestForm, {
  IReviewAccessRequestForm,
  ReviewAccessRequestFormInitialValues,
  ReviewAccessRequestFormYupSchema
} from './ReviewAccessRequestForm';

export enum administrativeActivityStatus {
  PENDING = 'pending',
  ACTIONED = 'actioned',
  REJECTED = 'rejected'
}

const useStyles = makeStyles((theme: Theme) => ({
  chip: {
    padding: '0px 8px',
    borderRadius: '4px',
    color: 'white'
  },
  chipPending: {
    backgroundColor: theme.palette.primary.light
  },
  chipActioned: {
    backgroundColor: theme.palette.success.light
  },
  chipRejected: {
    backgroundColor: theme.palette.error.light
  },
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  }
}));

/**
 * Page to display a list of user access.
 *
 * @return {*}
 */
const AccessRequestList: React.FC = () => {
  const classes = useStyles();

  const biohubApi = useBiohubApi();

  const [accessRequests, setAccessRequests] = useState<IGetAccessRequestsListResponse[]>([]);
  const [isLoadingAccessRequests, setIsLoadingAccessRequests] = useState(false);
  const [hasLoadedAccessRequests, setHasLoadedAccessRequests] = useState(false);

  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();
  const approvedCodeId = codes?.administrative_activity_status_type.find((item) => item.name === 'Actioned')?.id as any;
  const rejectedCodeId = codes?.administrative_activity_status_type.find((item) => item.name === 'Rejected')?.id as any;

  const [isLoadingCodes, setIsLoadingCodes] = useState(false);

  const [activeReviewDialog, setActiveReviewDialog] = useState<{
    open: boolean;
    request: IGetAccessRequestsListResponse | any;
  }>({
    open: false,
    request: null
  });

  const [openErrorDialogProps, setOpenErrorDialogProps] = useState<IErrorDialogProps>({
    dialogTitle: ReviewAccessRequestI18N.reviewErrorTitle,
    dialogText: ReviewAccessRequestI18N.reviewErrorText,
    open: false,
    onClose: () => {
      setOpenErrorDialogProps({ ...openErrorDialogProps, open: false });
    },
    onOk: () => {
      setOpenErrorDialogProps({ ...openErrorDialogProps, open: false });
    }
  });

  useEffect(() => {
    const getAccessRequests = async () => {
      const accessResponse = await biohubApi.admin.getAccessRequests();

      setAccessRequests(() => {
        setHasLoadedAccessRequests(true);
        setIsLoadingAccessRequests(false);
        return accessResponse;
      });
    };

    if (isLoadingAccessRequests || hasLoadedAccessRequests) {
      return;
    }

    setIsLoadingAccessRequests(true);

    getAccessRequests();
  }, [biohubApi.admin, isLoadingAccessRequests, hasLoadedAccessRequests]);

  useEffect(() => {
    const getCodes = async () => {
      const codesResponse = await biohubApi.codes.getAllCodeSets();

      if (!codesResponse) {
        // TODO error handling/messaging
        return;
      }

      setCodes(() => {
        setIsLoadingCodes(false);
        return codesResponse;
      });
    };

    if (isLoadingCodes || codes) {
      return;
    }

    setIsLoadingCodes(true);

    getCodes();
  }, [biohubApi.codes, isLoadingCodes, codes]);

  const handleReviewDialogApprove = async (values: IReviewAccessRequestForm) => {
    const updatedRequest = activeReviewDialog.request as IGetAccessRequestsListResponse;

    setActiveReviewDialog({ open: false, request: null });

    try {
      await biohubApi.admin.updateAccessRequest(
        updatedRequest.data.username,
        updatedRequest.data.identitySource,
        updatedRequest.id,
        approvedCodeId,
        values.system_roles
      );
    } catch (error) {
      setOpenErrorDialogProps({ ...openErrorDialogProps, open: true, dialogErrorDetails: error });
    }
  };

  const handleReviewDialogDeny = async () => {
    const updatedRequest = activeReviewDialog.request;

    setActiveReviewDialog({ open: false, request: null });

    try {
      await biohubApi.admin.updateAccessRequest(
        updatedRequest.data.username,
        updatedRequest.data.identitySource,
        updatedRequest.id,
        rejectedCodeId
      );
    } catch (error) {
      setOpenErrorDialogProps({ ...openErrorDialogProps, open: true, dialogErrorDetails: error });
    }
  };

  if (!hasLoadedAccessRequests || !codes) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <ErrorDialog {...openErrorDialogProps} />
      <RequestDialog
        dialogTitle={'Review Access Request'}
        open={activeReviewDialog.open}
        onClose={() => setActiveReviewDialog({ open: false, request: null })}
        onDeny={handleReviewDialogDeny}
        onApprove={handleReviewDialogApprove}
        component={{
          initialValues: ReviewAccessRequestFormInitialValues,
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
        <Box p={2}>
          <Typography variant="h2">Access Requests ({accessRequests?.length || 0})</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Regional Offices</TableCell>
                <TableCell>Request Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody data-testid="access-request-table">
              {!accessRequests?.length && (
                <TableRow data-testid={'access-request-row-0'}>
                  <TableCell colSpan={6} style={{ textAlign: 'center' }}>
                    No Access Requests
                  </TableCell>
                </TableRow>
              )}
              {accessRequests?.map((row, index) => {
                return (
                  <TableRow data-testid={`access-request-row-${index}`} key={index}>
                    <TableCell>{row.data?.name || 'Not Applicable'}</TableCell>
                    <TableCell>{row.data?.username || 'Not Applicable'}</TableCell>
                    <TableCell>{row.data?.company || 'Not Applicable'}</TableCell>
                    <TableCell>{row.data?.regional_offices?.join(', ') || 'Not Applicable'}</TableCell>
                    <TableCell>{getFormattedDate(DATE_FORMAT.MediumDateFormat2, row.create_date)}</TableCell>
                    <TableCell>
                      <Chip
                        className={clsx(
                          classes.chip,
                          (administrativeActivityStatus.ACTIONED === row.status_name?.toLowerCase() &&
                            classes.chipActioned) ||
                            (administrativeActivityStatus.REJECTED === row.status_name?.toLowerCase() &&
                              classes.chipRejected) ||
                            classes.chipPending
                        )}
                        label={row.status_name}
                      />
                    </TableCell>

                    <TableCell>
                      {row.status_name === 'Pending' && (
                        <Button
                          className={classes.actionButton}
                          color="primary"
                          variant="outlined"
                          onClick={() => setActiveReviewDialog({ open: true, request: row })}>
                          Review
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
