import { DialogTitle } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import { mdiLockOpenOutline, mdiLockOutline, mdiPencilOutline, mdiTrayArrowDown } from '@mdi/js';
import Icon from '@mdi/react';
import { IEditReportMetaForm } from 'components/attachments/EditReportMetaForm';
import ReportMeta from 'components/attachments/ReportMeta';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { DialogContext } from 'contexts/dialogContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetReportDetails, IGetSecurityReasons } from 'interfaces/useProjectApi.interface';
import React, { useContext, useState } from 'react';
import { getFormattedDateRangeString } from 'utils/Utils';
import { AttachmentType } from '../../constants/attachments';
import EditFileWithMetaDialog from './EditFileWithMetaDialog';
import SecurityDialog from './SecurityDialog';

const useStyles = makeStyles((theme: Theme) => ({
  docTitle: {
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden'
  },
  docDL: {
    margin: 0,
    '& dt': {
      flex: '0 0 200px',
      margin: '0',
      color: theme.palette.text.secondary
    },
    '& dd': {
      flex: '1 1 auto'
    }
  },
  docMetaRow: {
    display: 'flex'
  }
}));

export interface IViewFileWithDetailsDialogProps {
  projectId: number;
  surveyId?: number;
  open: boolean;
  onClose: () => void;
  onFileDownload: () => void;
  onSave: (fileMeta: IEditReportMetaForm) => Promise<void>;
  reportDetails: IGetReportDetails | null;
  attachmentSize: string;
  dialogProps?: DialogProps;
  fileType: string | null;
  refresh: () => void;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const ViewFileWithDetailsDialog: React.FC<IViewFileWithDetailsDialogProps> = (props) => {
  const classes = useStyles();
  const biohubApi = useBiohubApi();

  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  const [showEditFileWithMetaDialog, setShowEditFileWithMetaDialog] = useState<boolean>(false);

  const removeSecurity = async (securityReasons: IGetSecurityReasons[]) => {
    const securityIds = securityReasons.map((security) => {
      return security.security_reason_id;
    });

    if (props.reportDetails?.metadata?.attachment_id) {
      if (props.surveyId == undefined) {
        if (props.fileType === AttachmentType.REPORT) {
          await biohubApi.security.deleteProjectReportAttachmentSecurityReasons(
            props.projectId,
            props.reportDetails?.metadata?.attachment_id,
            securityIds
          );
        } else {
          await biohubApi.security.deleteProjectAttachmentSecurityReasons(
            props.projectId,
            props.reportDetails?.metadata?.attachment_id,
            securityIds
          );
        }
      } else {
        if (props.fileType === AttachmentType.REPORT) {
          await biohubApi.security.deleteSurveyReportAttachmentSecurityReasons(
            props.projectId,
            props.surveyId,
            props.reportDetails?.metadata?.attachment_id,
            securityIds
          );
        } else {
          await biohubApi.security.deleteSurveyAttachmentSecurityReasons(
            props.projectId,
            props.surveyId,
            props.reportDetails?.metadata?.attachment_id,
            securityIds
          );
        }
      }
    }
  };

  const dialogContext = useContext(DialogContext);

  const defaultYesNoDialogProps = {
    open: false,
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false }),
    onYes: () => dialogContext.setYesNoDialog({ open: false })
  };

  const showDeleteSecurityReasonDialog = (securityReasons: IGetSecurityReasons[]) => {
    let yesNoDialogProps;

    if (securityReasons.length == 1) {
      yesNoDialogProps = {
        ...defaultYesNoDialogProps,
        dialogTitle: 'Remove Security Reason',
        dialogText: 'Are you sure you want to remove the selected security reason? This action cannot be undone.'
      };
    } else {
      yesNoDialogProps = {
        ...defaultYesNoDialogProps,
        dialogTitle: 'Remove Security Reasons',
        dialogText: 'Are you sure you want to remove all security reasons? This action cannot be undone.'
      };
    }

    dialogContext.setYesNoDialog({
      ...yesNoDialogProps,
      open: true,
      yesButtonProps: { color: 'secondary' },
      onYes: () => {
        removeSecurity(securityReasons);
        dialogContext.setYesNoDialog({ open: false });
      }
    });
  };

  if (!props.open) {
    return <></>;
  }

  return (
    <>
      <SecurityDialog
        open={securityDialogOpen}
        onAccept={() => alert('Applyed')}
        onClose={() => setSecurityDialogOpen(false)}
      />

      <EditFileWithMetaDialog
        open={showEditFileWithMetaDialog}
        dialogTitle={'Edit Upload Report'}
        reportMetaData={props.reportDetails}
        onClose={() => {
          setShowEditFileWithMetaDialog(false);
        }}
        onSave={props.onSave}
        refresh={props.refresh}
      />

      <Dialog open={props.open} onClose={props.onClose} {...props.dialogProps} data-testid="view-meta-dialog">
        <DialogTitle data-testid="view-meta-dialog-title">
          <Typography variant="body2" color="textSecondary" style={{ fontWeight: 700 }}>
            VIEW DOCUMENT DETAILS
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="space-between">
            <Box style={{ maxWidth: '120ch' }}>
              <Typography variant="h2" component="h1" className={classes.docTitle}>
                {props.reportDetails?.metadata?.title}
              </Typography>
            </Box>
            <Box flex="0 0 auto">
              <Button
                variant="contained"
                color="primary"
                startIcon={<Icon path={mdiTrayArrowDown} size={0.8} />}
                onClick={() => props.onFileDownload()}>
                Download ({props.attachmentSize})
              </Button>
              {props.fileType === 'Report' && (
                <Box>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Icon path={mdiPencilOutline} size={0.8} />}
                    onClick={() => setShowEditFileWithMetaDialog(true)}>
                    Edit Details
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
          <Box mt={5}>
            <Alert severity="info" style={{ marginBottom: '24px' }}>
              <AlertTitle>Alert Title</AlertTitle>
              Document requires a security review
            </Alert>

            {props.reportDetails?.metadata && props.fileType === 'Report' && (
              <ReportMeta reportDetails={props.reportDetails} />
            )}
          </Box>
          <Paper variant="outlined" style={{ marginTop: '24px' }}>
            <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h5" component="h3">
                Security Reasons
              </Typography>
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Icon path={mdiLockOutline} size={0.8} />}
                  style={{ marginRight: '8px' }}
                  onClick={() => setSecurityDialogOpen(true)}>
                  Add Security
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    if (props.reportDetails?.security_reasons) {
                      showDeleteSecurityReasonDialog(props.reportDetails?.security_reasons);
                    }
                  }}
                  startIcon={<Icon path={mdiLockOpenOutline} size={0.8} />}>
                  Remove Security
                </Button>
              </Box>
            </Toolbar>
            <Divider></Divider>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="200">Category</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell width="160">Dates</TableCell>
                    <TableCell width="160">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {props.reportDetails?.security_reasons &&
                    props.reportDetails?.security_reasons?.length > 0 &&
                    props.reportDetails?.security_reasons?.map((row, index) => {
                      return (
                        <TableRow key={`${row.category}-${index}`}>
                          <TableCell>{row.category}</TableCell>
                          <TableCell>
                            <Typography style={{ fontWeight: 700 }}>{row.reason}</Typography>
                            <Typography variant="body1" color="textSecondary">
                              {row.reason_description}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" component="div">
                              Submitted
                            </Typography>
                            <Typography variant="body2" component="div" color="textSecondary">
                              {getFormattedDateRangeString(
                                DATE_FORMAT.ShortMediumDateFormat,
                                props.reportDetails?.metadata?.last_modified || ''
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => showDeleteSecurityReasonDialog([row])}
                              startIcon={<Icon path={mdiLockOpenOutline} size={0.8} />}>
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                  {props.reportDetails?.security_reasons?.length == 0 && (
                    <TableRow key={`0`}>
                      <TableCell>Security Administration</TableCell>
                      <TableCell>
                        <Typography style={{ fontWeight: 700 }}>Awaiting Security Review</Typography>
                        <Typography variant="body1" color="textSecondary">
                          Awaiting review to determine if security-reasons should be assigned
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" component="div">
                          Submitted
                        </Typography>
                        <Typography variant="body2" component="div" color="textSecondary">
                          {getFormattedDateRangeString(
                            DATE_FORMAT.ShortMediumDateFormat,
                            props.reportDetails?.metadata?.last_modified || ''
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onClose} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ViewFileWithDetailsDialog;
