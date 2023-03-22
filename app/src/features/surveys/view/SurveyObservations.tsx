import Collapse from '@material-ui/core/Collapse';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import { makeStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import LinearProgress from '@material-ui/core/LinearProgress';
import {
  mdiAlertCircleOutline, mdiDotsVertical, mdiFileOutline, mdiImport, mdiInformationOutline, mdiTrashCanOutline, mdiTrayArrowDown, mdiFileAlertOutline
} from '@mdi/js';
import Icon from '@mdi/react';
import ComponentDialog from 'components/dialog/ComponentDialog';
import FileUpload from 'components/file-upload/FileUpload';
import { IUploadHandler } from 'components/file-upload/FileUploadItem';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useInterval } from 'hooks/useInterval';
import {
  IGetObservationSubmissionResponseMessages,
  IUploadObservationSubmissionResponse,
  ObservationSubmissionMessageSeverityLabel
} from 'interfaces/useObservationApi.interface';
import React, { useCallback, useContext, useEffect, useState } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  importFile: {
    display: 'flex',
    padding: theme.spacing(2),
    overflow: 'hidden',
    '& .importFile-icon': {
      color: theme.palette.text.secondary
    },
    '&.error': {
      borderColor: theme.palette.error.main,
      '& .importFile-icon': {
        color: theme.palette.error.main,
      }
    }
  },
  alertActions: {
    '& > *': {
      marginLeft: theme.spacing(2)
    }
  },
  observationFileName: {
    marginTop: '2px',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textDecoration: 'underline',
    cursor: 'pointer'
  }
}));

const SurveyObservations: React.FC = () => {
const BorderLinearProgress = withStyles((theme: Theme) =>
  createStyles({
    root: {
      height: 6,
      borderRadius: 3,
    },
    colorPrimary: {
      backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 300 : 700],
    },
    bar: {
      borderRadius: 3,
      backgroundColor: '#1976D2',
    },
  }),
)(LinearProgress);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const biohubApi = useBiohubApi();
  const dialogContext = useContext(DialogContext);
  const classes = useStyles();
  const surveyContext = useContext(SurveyContext);
  const [openImportObservations, setOpenImportObservations] = useState(false);
  const [willRefreshOnClose, setWillRefreshOnClose] = useState(false);

  const projectId = surveyContext.projectId as number;
  const surveyId = surveyContext.surveyId as number;

  const refresh = useCallback(() => {
    if (projectId && surveyId) {
      surveyContext.surveyDataLoader.refresh(projectId, surveyId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, surveyId]);

  const submissionDataLoader = useDataLoader(() => biohubApi.observation.getObservationSubmission(projectId, surveyId));

  submissionDataLoader.load();

  const refreshSubmission = submissionDataLoader.refresh;
  const occurrenceSubmission = submissionDataLoader.data;
  const occurrenceSubmissionId = occurrenceSubmission?.id;
  const submissionMessageTypes = occurrenceSubmission?.messageTypes || [];
  const submissionExists = Boolean(occurrenceSubmission);

  const submissionPollingInterval = useInterval(refreshSubmission, 5000, 60000);
  alphabetizeSubmissionMessages(submissionMessageTypes);
  useEffect(() => {
    if (submissionExists) {
      submissionPollingInterval.enable();
    } else {
      submissionPollingInterval.disable();
    }
  }, [submissionExists, submissionPollingInterval]);

  useEffect(() => {
    if (occurrenceSubmission?.isValidating === false) {
      submissionPollingInterval.disable();
    }
  }, [occurrenceSubmission, submissionPollingInterval]);

  const defaultUploadYesNoDialogProps = {
    dialogTitle: 'Import Observation Data',
    dialogText:
      'Are you sure you want to import a different file for observations? This will overwrite the existing observations file.',
    open: false,
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false }),
    onYes: () => dialogContext.setYesNoDialog({ open: false })
  };

  const defaultDeleteYesNoDialogProps = {
    ...defaultUploadYesNoDialogProps,
    dialogTitle: 'Delete Observations?',
    dialogText: 'Are you sure you want to delete this observation file? This action cannot be undone.'
    
  };

  const importObservations = (): IUploadHandler => {
    return async (file, cancelToken, handleFileUploadProgress) => {
      return biohubApi.observation
        .uploadObservationSubmission(projectId, surveyId, file, cancelToken, handleFileUploadProgress)
        .then((result: IUploadObservationSubmissionResponse) => {
          if (!result || !result.submissionId) {
            return;
          }

          if (file.type === 'application/x-zip-compressed' || file.type === 'application/zip') {
            biohubApi.observation.processDWCFile(projectId, result.submissionId).then(refresh);
          } else {
            biohubApi.observation.processOccurrences(projectId, result.submissionId, surveyId);
          }
        })
        .finally(() => {
          setWillRefreshOnClose(true);
        });
    };
  };

  function handleOpenImportObservations() {
    setOpenImportObservations(true);
    setWillRefreshOnClose(false);
  }

  function handleCloseImportObservations() {
    if (willRefreshOnClose) {
      refreshSubmission();
    }

    setOpenImportObservations(false);
  }

  function softDeleteSubmission() {
    if (!occurrenceSubmissionId) {
      return;
    }

    biohubApi.observation.deleteObservationSubmission(projectId, surveyId, occurrenceSubmissionId).then(() => {
      refresh();
      refreshSubmission();
    });
  }

  function showUploadDialog() {
    if (submissionExists) {
      dialogContext.setYesNoDialog({
        ...defaultUploadYesNoDialogProps,
        open: true,
        onYes: () => {
          handleOpenImportObservations();
          dialogContext.setYesNoDialog({ open: false });
        }
      });
    } else {
      handleOpenImportObservations();
    }
  }

  function showDeleteDialog() {
    dialogContext.setYesNoDialog({
      ...defaultDeleteYesNoDialogProps,
      open: true,
      yesButtonProps: { color: 'secondary' },
      yesButtonLabel: 'Delete',
      noButtonProps: {color: 'default'},
      noButtonLabel: 'Cancel',
      onYes: () => {
        softDeleteSubmission();
        dialogContext.setYesNoDialog({ open: false });
      }
    });
  }

  function alphabetizeSubmissionMessages(data: IGetObservationSubmissionResponseMessages[]) {
    // sorts data in place, no need to return
    data.sort((messageA, messageB) => {
      // Message A is sorted before B
      if (messageA.messageTypeLabel < messageB.messageTypeLabel) {
        return -1;
      }

      // Message B is sorted before A
      if (messageA.messageTypeLabel > messageB.messageTypeLabel) {
        return 1;
      }

      // Items are already in order
      return 0;
    });
  }

  // const submissionAlertAction = () => (
  //   <Box>
  //     <IconButton aria-label="open" color="inherit" onClick={openFileContents}>
  //       <Icon path={mdiDownload} size={1} />
  //     </IconButton>
  //     <IconButton aria-label="delete" color="inherit" onClick={showDeleteDialog}>
  //       <Icon path={mdiTrashCanOutline} size={1} />
  //     </IconButton>
  //   </Box>
  // );

  const openFileContents = useCallback(() => {
    if (!occurrenceSubmissionId) {
      return;
    }

    biohubApi.survey
      .getObservationSubmissionSignedURL(projectId, surveyId, occurrenceSubmissionId)
      .then((objectUrl: string) => {
        window.open(objectUrl);
      })
      .catch((_err: any) => {
        return;
      });
  }, [biohubApi.survey, occurrenceSubmissionId, projectId, surveyId]);

  if (!submissionExists && submissionDataLoader.isLoading) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  type AlertSeverityLevel = 'error' | 'info' | 'success' | 'warning';

  const alertSeverityFromSeverityLabel = (severity: ObservationSubmissionMessageSeverityLabel): AlertSeverityLevel => {
    switch (severity) {
      case 'Warning':
        return 'warning';

      case 'Error':
        return 'error';

      case 'Notice':
      default:
        return 'info';
    }
  };

  let submissionStatusIcon = occurrenceSubmission?.isValidating ? mdiFileOutline : mdiFileOutline;
  let submissionStatusSeverity: AlertSeverityLevel = 'info';

  if (submissionMessageTypes.some((messageType) => messageType.severityLabel === 'Error')) {
    submissionStatusIcon = mdiFileAlertOutline;
    submissionStatusSeverity = 'error';
  } else if (submissionMessageTypes.some((messageType) => messageType.severityLabel === 'Warning')) {
    submissionStatusIcon = mdiFileAlertOutline;
    submissionStatusSeverity = 'warning';
  } else if (submissionMessageTypes.some((messageType) => messageType.severityLabel === 'Notice')) {
    submissionStatusIcon = mdiInformationOutline;
  }

  const openContextMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeContextMenu = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Paper elevation={0}>
        <H2ButtonToolbar
          label="Observations"
          buttonLabel="Import"
          buttonTitle="Import Observations"
          buttonProps={{ variant: 'contained', color: 'primary' }}
          buttonStartIcon={<Icon path={mdiImport} size={1} />}
          buttonOnClick={() => showUploadDialog()}
        />

        <Divider />

        <Box p={3}>

          {!occurrenceSubmission?.isValidating && (
            <>
              {submissionStatusSeverity === 'error' && (
                <Box mb={2} mt={3}>
                  <Typography data-testid="observations-error-details" variant="body1">
                    Resolve the following errors in your local file and re-import.
                  </Typography>
                </Box>
              )}

              {submissionMessageTypes.length > 0 && (
                <Box mt={1}>
                  {
                    // Alphabetize message types for consistency
                    submissionMessageTypes.map((messageType) => {
                      return (
                        <Box key={messageType.messageTypeLabel}>
                          <Alert severity={alertSeverityFromSeverityLabel(messageType.severityLabel)}>
                            {messageType.messageTypeLabel}
                          </Alert>
                          <Box component="ul" my={3}>
                            {messageType.messages.map((messageObject: { id: number; message: string }) => {
                              return (
                                <li key={messageObject.id}>
                                  <Typography variant="body2">{messageObject.message}</Typography>
                                </li>
                              );
                            })}
                          </Box>
                        </Box>
                      );
                    })
                  }
                </Box>
              )}
            </>
          )}

          
          <Box style={{display: 'none'}} mb={3}>
            <Alert
              severity="error"
              icon={<Icon path={mdiAlertCircleOutline} size={1} />}>
              <AlertTitle>Failed to import observations</AlertTitle>
              One or more errors occurred while attempting to import your observations file.

              <Box mt={3}>
                <Box component="section">
                  <Typography variant="body2"><strong>Section Title</strong></Typography>
                  <Box component="ul" mt={1} mb={0} pl={4}>
                    <li>
                      <Typography variant="body2">Error Message</Typography>
                    </li>
                    <li>
                      <Typography variant="body2">Error Message</Typography>
                    </li>
                  </Box>
                </Box>
              </Box>

              <Box mt={3}>
                <Box component="section">
                  <Typography variant="body2"><strong>Section Title</strong></Typography>
                  <Box component="ul" mt={1} mb={0} pl={4}>
                    <li>
                      <Typography variant="body2">Error Message</Typography>
                    </li>
                    <li>
                      <Typography variant="body2">Error Message</Typography>
                    </li>
                  </Box>
                </Box>
              </Box>

            </Alert>
          </Box>

          {!submissionExists ? (
            <>
              <Paper variant="outlined">
                <Box p={3} textAlign="center">
                  <Typography data-testid="observations-nodata" variant="body2" color="textSecondary">
                    No Observation Data. &nbsp;
                    <Link onClick={handleOpenImportObservations}>Click Here to Import</Link>
                  </Typography>
                </Box>
              </Paper>
            </>
          ) : (
            <>
              <Paper variant="outlined" className={classes.importFile + ` ` + `${submissionStatusSeverity}`}>
                
                <Box className="importFile-icon" flex="0 0 auto" mt={1.2} mr={1.7}>
                  <Icon path={submissionStatusIcon} size={1} />
                </Box>

                <Box mr={2} flex="1 1 auto" style={{overflow: 'hidden'}}>
                  <Typography className={classes.observationFileName} variant="body2" component="div" onClick={openFileContents}>
                    <strong>{occurrenceSubmission?.inputFileName}</strong>
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {occurrenceSubmission?.isValidating
                      ? 'Processing file. Please wait...'
                      : occurrenceSubmission?.status}
                  </Typography>

                  <Collapse in={occurrenceSubmission?.isValidating} collapsedHeight="0">
                    <Box mt={2}>
                      <BorderLinearProgress />
                    </Box>
                  </Collapse>
                </Box>

                {!occurrenceSubmission?.isValidating && (
                  <Box flex="0 0 auto" display="flex" alignItems="center">

                    {submissionStatusSeverity === 'info' && (
                      <Box mr={2}>
                        <Chip label="Unsubmitted" color="primary" />
                      </Box>
                    )}

                    <Box>
                      <IconButton aria-controls="context-menu" aria-haspopup="true" onClick={openContextMenu}>
                        <Icon path={mdiDotsVertical} size={1} />
                      </IconButton>
                      <Menu
                        keepMounted
                        id="context-menu"
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={closeContextMenu}
                        anchorOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right'
                        }}
                      >
                        <MenuItem onClick={openFileContents}>
                          <ListItemIcon>
                            <Icon path={mdiTrayArrowDown} size={1} />
                          </ListItemIcon>
                          Download
                        </MenuItem>
                        <MenuItem onClick={showDeleteDialog}>
                          <ListItemIcon>
                            <Icon path={mdiTrashCanOutline} size={1} />
                          </ListItemIcon>
                          Delete
                        </MenuItem>
                      </Menu>
                    </Box>
                  </Box>
                )}

              </Paper>
            </>
          )}
        </Box>
      </Paper>

      <ComponentDialog
        open={openImportObservations}
        dialogTitle="Import Observation Data"
        onClose={handleCloseImportObservations}>
        <FileUpload
          dropZoneProps={{ maxNumFiles: 1, acceptedFileExtensions: '.csv, .xls, .txt, .zip, .xlsm, .xlsx' }}
          uploadHandler={importObservations()}
        />
      </ComponentDialog>
    </>
  );
};

export default SurveyObservations;
