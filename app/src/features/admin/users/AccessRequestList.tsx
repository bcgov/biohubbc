import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
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
import RequestDialog from 'components/dialog/RequestDialog';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { ReviewAccessRequestI18N } from 'constants/i18n';
import { AdministrativeActivityStatusType } from 'constants/misc';
import { DialogContext } from 'contexts/dialogContext';
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

const useStyles = makeStyles((theme: Theme) => ({
  chip: {
    padding: '0px 8px',
    borderRadius: '4px',
    color: 'white'
  },
  chipPending: {
    backgroundColor: theme.palette.primary.main
  },
  chipActioned: {
    backgroundColor: theme.palette.success.main
  },
  chipRejected: {
    backgroundColor: theme.palette.error.main
  },
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
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

  const approvedCodeId = codes?.administrative_activity_status_type.find(
    (item) => item.name === AdministrativeActivityStatusType.ACTIONED
  )?.id as any;
  const rejectedCodeId = codes?.administrative_activity_status_type.find(
    (item) => item.name === AdministrativeActivityStatusType.REJECTED
  )?.id as any;

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
      await biohubApi.admin.updateAccessRequest(
        updatedRequest.data.username,
        updatedRequest.data.identitySource,
        updatedRequest.id,
        approvedCodeId,
        values.system_roles
      );

      refresh();
    } catch (error) {
      dialogContext.setErrorDialog({ ...defaultErrorDialogProps, open: true, dialogErrorDetails: error });
    }
  };

  const handleReviewDialogDeny = async () => {
    const updatedRequest = activeReviewDialog.request as IGetAccessRequestsListResponse;

    setActiveReviewDialog({ open: false, request: null });

    try {
      await biohubApi.admin.updateAccessRequest(
        updatedRequest.data.username,
        updatedRequest.data.identitySource,
        updatedRequest.id,
        rejectedCodeId
      );

      refresh();
    } catch (error) {
      dialogContext.setErrorDialog({ ...defaultErrorDialogProps, open: true, dialogErrorDetails: error });
    }
  };

  const getChipIcon = (status_name: string) => {
    let chipLabel;
    let chipStatusClass;

    if (AdministrativeActivityStatusType.REJECTED === status_name) {
      chipLabel = 'DENIED';
      chipStatusClass = classes.chipRejected;
    } else if (AdministrativeActivityStatusType.ACTIONED === status_name) {
      chipLabel = 'APPROVED';
      chipStatusClass = classes.chipActioned;
    } else {
      chipLabel = 'PENDING';
      chipStatusClass = classes.chipPending;
    }

    return <Chip className={clsx(classes.chip, chipStatusClass)} label={chipLabel} />;
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
            system_roles: [activeReviewDialog.request?.data?.role]
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
              regional_offices={codes?.regional_offices}
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
                const regional_offices = row.data?.regional_offices
                  ?.map((regionId) => codes.regional_offices.find((code) => code.id === regionId)?.name)
                  .join(', ');

                return (
                  <TableRow data-testid={`access-request-row-${index}`} key={index}>
                    <TableCell>{row.data?.name || ''}</TableCell>
                    <TableCell>{row.data?.username || ''}</TableCell>
                    <TableCell>{row.data?.company || 'Not Applicable'}</TableCell>
                    <TableCell>{regional_offices || 'Not Applicable'}</TableCell>
                    <TableCell>{getFormattedDate(DATE_FORMAT.MediumDateFormat2, row.create_date)}</TableCell>
                    <TableCell>{getChipIcon(row.status_name)}</TableCell>

                    <TableCell>
                      {row.status_name === AdministrativeActivityStatusType.PENDING && (
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
