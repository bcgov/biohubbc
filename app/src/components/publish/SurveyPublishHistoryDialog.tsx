import { mdiDotsVertical, mdiOpenInNew, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { GridColDef } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useConfigContext, useDialogContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { ISubmissionHistoryRow } from 'interfaces/usePublishApi.interface';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getFormattedDate } from 'utils/Utils';

interface ISurveyPublishHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: number;
  surveyId: number;
  submissionId: string | undefined;
}

const SurveyPublishHistoryDialog = (props: ISurveyPublishHistoryDialogProps) => {
  const { open, onClose, projectId, surveyId, submissionId } = props;
  const config = useConfigContext();
  const biohubApi = useBiohubApi();
  const dialogContext = useDialogContext();

  const [actionMenuAnchor, setActionMenuAnchor] = useState<{
    anchor: HTMLElement;
    row: ISubmissionHistoryRow;
  } | null>(null);
  const rowToDeleteRef = useRef<ISubmissionHistoryRow | null>(null);

  const historyDataLoader = useDataLoader((projectId: number, surveyId: number, submissionId: string) =>
    biohubApi.publish.getSubmissionHistory(projectId, surveyId, submissionId)
  );

  useEffect(() => {
    if (open && submissionId) {
      historyDataLoader.load(projectId, surveyId, submissionId);
    } else if (!open) {
      historyDataLoader.clearData();
      setActionMenuAnchor(null);
      rowToDeleteRef.current = null;
    }
  }, [open, submissionId, projectId, surveyId, historyDataLoader]);

  const closeDeleteDialog = useCallback(() => {
    dialogContext.setYesNoDialog({ open: false });
    rowToDeleteRef.current = null;
  }, [dialogContext]);

  const handleConfirmDelete = useCallback(async () => {
    const toDelete = rowToDeleteRef.current;
    if (!submissionId || !toDelete) {
      closeDeleteDialog();
      return;
    }

    try {
      await biohubApi.publish.deleteSubmissionUpload(projectId, surveyId, submissionId, toDelete.submissionUploadId);
      closeDeleteDialog();
      await historyDataLoader.refresh(projectId, surveyId, submissionId);
      dialogContext.setSnackbar({ snackbarMessage: 'Upload request cancelled.', open: true });
    } catch (error: unknown) {
      const message = (error as APIError).message || 'Failed to cancel upload request';
      closeDeleteDialog();
      dialogContext.setSnackbar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="div">
              <strong>Error deleting upload</strong>
            </Typography>
            <Typography variant="body2" component="div">
              {message}
            </Typography>
          </>
        ),
        open: true
      });
    }
  }, [submissionId, projectId, surveyId, biohubApi.publish, historyDataLoader, dialogContext, closeDeleteDialog]);

  const handleDeleteClick = () => {
    if (!actionMenuAnchor) {
      return;
    }
    rowToDeleteRef.current = actionMenuAnchor.row;
    setActionMenuAnchor(null);
    dialogContext.setYesNoDialog({
      open: true,
      dialogTitle: 'Cancel Upload Request',
      dialogText: 'Are you sure you want to cancel this upload request?',
      yesButtonLabel: 'Cancel request',
      noButtonLabel: 'Keep request',
      yesButtonProps: { color: 'error' },
      noButtonProps: { color: 'primary', variant: 'outlined' },
      onClose: closeDeleteDialog,
      onNo: closeDeleteDialog,
      onYes: handleConfirmDelete
    });
  };

  const formatStatus = useCallback((status: string) => {
    if (status.toLowerCase() === 'deleted') {
      return 'Cancelled';
    }

    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }, []);

  const openBioHubSubmission = useCallback(
    (row: ISubmissionHistoryRow) => {
      if (!row.submissionId) {
        setActionMenuAnchor(null);
        return;
      }

      const base = (config.BACKBONE_PUBLIC_WEB_HOST || '').replace(/\/$/, '');
      window.open(`${base}/submissions/${row.submissionId}`, '_blank', 'noopener,noreferrer');
      setActionMenuAnchor(null);
    },
    [config.BACKBONE_PUBLIC_WEB_HOST]
  );

  const rows = historyDataLoader.data ?? [];
  const errorMessage = historyDataLoader.error ? (historyDataLoader.error as APIError).message : '';

  const columns = useMemo<GridColDef<ISubmissionHistoryRow>[]>(
    () => [
      {
        field: 'createDate',
        headerName: 'Date',
        flex: 1.5,
        sortable: false,
        renderCell: (params) => {
          return getFormattedDate(DATE_FORMAT.MediumDateTimeFormat, params.row.createDate) || params.row.createDate;
        }
      },
      {
        field: 'status',
        headerName: 'Status',
        flex: 1,
        sortable: false,
        renderCell: (params) => formatStatus(params.row.status)
      },
      {
        field: 'actions',
        headerName: '',
        sortable: false,
        filterable: false,
        width: 72,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => {
          if (!(params.row.status === 'submitted' || params.row.status === 'approved')) {
            return null;
          }

          return (
            <IconButton
              size="small"
              aria-label="Row actions"
              onClick={(e) => setActionMenuAnchor({ anchor: e.currentTarget, row: params.row })}
              sx={{ minWidth: 40, minHeight: 40 }}>
              <Icon path={mdiDotsVertical} size={1.25} />
            </IconButton>
          );
        }
      }
    ],
    [formatStatus]
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="survey-publish-history-dialog-title"
        maxWidth="md"
        fullWidth>
        <DialogTitle id="survey-publish-history-dialog-title">Publish History</DialogTitle>
        <DialogContent>
          {!submissionId && (
            <Typography variant="body2" color="textSecondary">
              No submission found for this survey.
            </Typography>
          )}

          {submissionId && !!errorMessage && (
            <Typography variant="body2" color="error">
              {errorMessage}
            </Typography>
          )}

          {submissionId && !errorMessage && (
            <LoadingGuard
              isLoading={historyDataLoader.isLoading || !historyDataLoader.isReady}
              isLoadingFallback={<SkeletonTable />}
              hasNoData={!rows.length}
              hasNoDataFallback={
                <Typography variant="body2" color="textSecondary">
                  No history yet.
                </Typography>
              }>
              <Box>
                <StyledDataGrid
                  noRowsMessage="No history yet."
                  rows={rows}
                  columns={columns}
                  loading={historyDataLoader.isLoading || !historyDataLoader.isReady}
                  getRowId={(row) => row.submissionUploadId}
                  rowSelection={false}
                  checkboxSelection={false}
                  disableRowSelectionOnClick
                  disableColumnSelector
                  disableColumnFilter
                  disableColumnMenu
                  hideFooter
                />
              </Box>
            </LoadingGuard>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary" variant="contained" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        open={Boolean(actionMenuAnchor)}
        onClose={() => setActionMenuAnchor(null)}
        anchorEl={actionMenuAnchor?.anchor}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        {actionMenuAnchor?.row.status === 'approved' && (
          <MenuItem onClick={() => openBioHubSubmission(actionMenuAnchor.row)}>
            <ListItemIcon>
              <Icon path={mdiOpenInNew} size={1} />
            </ListItemIcon>
            <ListItemText>View in BioHub</ListItemText>
          </MenuItem>
        )}
        {actionMenuAnchor?.row.status === 'submitted' && (
          <MenuItem
            onClick={() => {
              handleDeleteClick();
            }}>
            <ListItemIcon>
              <Icon path={mdiTrashCanOutline} size={1} />
            </ListItemIcon>
            <ListItemText>Cancel</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default SurveyPublishHistoryDialog;
