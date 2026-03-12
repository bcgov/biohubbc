import { mdiDotsVertical, mdiOpenInNew, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
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
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useConfigContext, useDialogContext } from 'hooks/useContext';
import { ISubmissionHistoryRow } from 'interfaces/usePublishApi.interface';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getFormattedDate } from 'utils/Utils';

interface ISurveyPublishHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  submissionId: string | undefined;
}

/**
 * Dialog showing publish history for a survey: table with Date, Status, and delete action for submitted uploads.
 */
function renderDeleteErrorSnackbar(message: string) {
  return (
    <>
      <Typography variant="body2" component="div">
        <strong>Error deleting upload</strong>
      </Typography>
      <Typography variant="body2" component="div">
        {message}
      </Typography>
    </>
  );
}

const SurveyPublishHistoryDialog = (props: ISurveyPublishHistoryDialogProps) => {
  const { open, onClose, submissionId } = props;
  const config = useConfigContext();
  const biohubApi = useBiohubApi();
  const dialogContext = useDialogContext();

  const [history, setHistory] = useState<ISubmissionHistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<{
    anchor: HTMLElement;
    row: ISubmissionHistoryRow;
  } | null>(null);
  const rowToDeleteRef = useRef<ISubmissionHistoryRow | null>(null);

  const loadHistory = useCallback(async () => {
    if (!submissionId) {
      setHistory([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await biohubApi.publish.getSubmissionHistory(submissionId);
      setHistory(data ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load publish history';
      setError(message);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [submissionId, biohubApi.publish]);

  useEffect(() => {
    if (open && submissionId) {
      loadHistory();
    } else if (!open) {
      setHistory([]);
      setError(null);
      setActionMenuAnchor(null);
      rowToDeleteRef.current = null;
    }
  }, [open, submissionId, loadHistory]);

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
      await biohubApi.publish.deleteSubmissionUpload(submissionId, toDelete.submissionUploadId);
      closeDeleteDialog();
      setHistory((prev) =>
        prev.map((r) => (r.submissionUploadId === toDelete.submissionUploadId ? { ...r, status: 'deleted' } : r))
      );
      dialogContext.setSnackbar({ snackbarMessage: 'Upload request cancelled.', open: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to cancel upload request';
      closeDeleteDialog();
      dialogContext.setSnackbar({
        snackbarMessage: renderDeleteErrorSnackbar(message),
        open: true
      });
    }
  }, [submissionId, biohubApi.publish, dialogContext, closeDeleteDialog]);

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

  const formatStatus = (status: string) => {
    if (status.toLowerCase() === 'deleted') {
      return 'Cancelled';
    }
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

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
          {submissionId && loading && (
            <Typography variant="body2" color="textSecondary">
              Loading...
            </Typography>
          )}
          {submissionId && error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
          {submissionId && !loading && !error && history.length === 0 && (
            <Typography variant="body2" color="textSecondary">
              No history yet.
            </Typography>
          )}
          {submissionId && !loading && !error && history.length > 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right" padding="checkbox" sx={{ width: 48 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((row) => (
                    <TableRow key={row.submissionUploadId}>
                      <TableCell>
                        {getFormattedDate(DATE_FORMAT.MediumDateTimeFormat, row.createDate) || row.createDate}
                      </TableCell>
                      <TableCell>{formatStatus(row.status)}</TableCell>
                      <TableCell align="right" padding="checkbox">
                        {(row.status === 'submitted' || row.status === 'approved') && (
                          <IconButton
                            size="small"
                            aria-label="Row actions"
                            onClick={(e) => setActionMenuAnchor({ anchor: e.currentTarget, row })}
                            sx={{ minWidth: 40, minHeight: 40 }}>
                            <Icon path={mdiDotsVertical} size={1.25} />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
          <MenuItem
            onClick={() => {
              const base = (config.BACKBONE_PUBLIC_WEB_HOST || '').replace(/\/$/, '');
              const url = `${base}/submissions/${actionMenuAnchor.row.submissionId}`;
              window.open(url, '_blank', 'noopener,noreferrer');
              setActionMenuAnchor(null);
            }}>
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
