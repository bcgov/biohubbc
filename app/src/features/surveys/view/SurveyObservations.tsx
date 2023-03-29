import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import LinearProgress from '@material-ui/core/LinearProgress';
import Link from '@material-ui/core/Link';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles, Theme, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import {
  mdiAlertCircleOutline,
  mdiDotsVertical,
  mdiFileAlertOutline,
  mdiFileOutline,
  mdiImport,
  mdiInformationOutline,
  mdiTrashCanOutline,
  mdiTrayArrowDown
} from '@mdi/js';
import Icon from '@mdi/react';
import clsx from 'clsx';
import { SubmitStatusChip } from 'components/chips/SubmitStatusChip';
import ComponentDialog from 'components/dialog/ComponentDialog';
import FileUpload from 'components/file-upload/FileUpload';
import { IUploadHandler } from 'components/file-upload/FileUploadItem';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { BioHubSubmittedStatusType } from 'constants/misc';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useInterval } from 'hooks/useInterval';
import {
  IGetObservationSubmissionResponseMessages,
  ISurveySupplementaryData,
  IUploadObservationSubmissionResponse
} from 'interfaces/useObservationApi.interface';
import React, { useCallback, useContext, useEffect, useState } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  importFile: {
    display: 'flex',
    minHeight: '82px',
    padding: theme.spacing(2),
    paddingLeft: '20px',
    overflow: 'hidden',
    '& .importFile-icon': {
      color: theme.palette.text.secondary
    },
    '&.error': {
      borderColor: theme.palette.error.main,
      '& .importFile-icon': {
        color: theme.palette.error.main
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
        borderRadius: 3
      },
      colorPrimary: {
        backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 300 : 700]
      },
      bar: {
        borderRadius: 3,
        backgroundColor: '#1976D2'
      }
    })
  )(LinearProgress);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const biohubApi = useBiohubApi();
  const dialogContext = useContext(DialogContext);
  const classes = useStyles();
  const surveyContext = useContext(SurveyContext);
  const [openImportObservations, setOpenImportObservations] = useState(false);
  const [willRefreshOnClose, setWillRefreshOnClose] = useState(false);
  const [fileName, setFileName] = useState('');

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

  useEffect(() => {
    submissionDataLoader.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveyContext.surveyDataLoader]);

  const refreshSubmission = submissionDataLoader.refresh;
  const occurrenceSubmission = submissionDataLoader.data?.surveyObservationData;
  const occurrenceSupplementaryData = submissionDataLoader.data?.surveyObservationSupplementaryData;
  const occurrenceSubmissionId = occurrenceSubmission?.occurrence_submission_id;
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
    dialogTitle: 'Import New Observation Data',
    dialogText: 'Importing a new file will overwrite the existing observations data. Are you sure you want to proceed?',
    open: false,
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false }),
    onYes: () => dialogContext.setYesNoDialog({ open: false })
  };

  const defaultDeleteYesNoDialogProps = {
    ...defaultUploadYesNoDialogProps,
    dialogTitle: 'Delete Observations?',
    dialogText: 'Are you sure you want to delete this file? This action cannot be undone.'
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
          setAnchorEl(null);
          setFileName(file.name);
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
      surveyContext.surveyDataLoader.refresh(projectId, surveyId);
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
      noButtonProps: { color: 'default' },
      noButtonLabel: 'Cancel',
      onYes: () => {
        softDeleteSubmission();
        dialogContext.setYesNoDialog({ open: false });
        surveyContext.surveyDataLoader.refresh(projectId, surveyId);
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

  const getSubmissionStatus = (
    supplementaryData: ISurveySupplementaryData | null | undefined
  ): BioHubSubmittedStatusType => {
    if (supplementaryData?.event_timestamp) {
      return BioHubSubmittedStatusType.SUBMITTED;
    }
    return BioHubSubmittedStatusType.UNSUBMITTED;
  };

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

  type AlertSeverityLevel = 'error' | 'info' | 'success' | 'warning';

  let submissionStatusIcon = mdiFileOutline;
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
                <Box mb={3}>
                  <Alert severity="error" icon={<Icon path={mdiAlertCircleOutline} size={1} />}>
                    <AlertTitle>Failed to import observations</AlertTitle>
                    One or more errors occurred while attempting to import your observations file.
                    {submissionMessageTypes.map((messageType) => {
                      return (
                        <Box key={messageType.messageTypeLabel} mt={3}>
                          <Box component="section">
                            <Typography variant="body2">
                              <strong>{messageType.messageTypeLabel}</strong>
                            </Typography>
                            <Box component="ul" mt={1} mb={0} pl={4}>
                              {messageType.messages.map((messageObject: { id: number; message: string }) => {
                                return (
                                  <li key={messageObject.id}>
                                    <Typography variant="body2" component="span">
                                      {messageObject.message}
                                    </Typography>
                                  </li>
                                );
                              })}
                            </Box>
                          </Box>
                        </Box>
                      );
                    })}
                  </Alert>
                </Box>
              )}
            </>
          )}

          {/* No submission exists */}
          {!submissionExists && !submissionDataLoader.isLoading && (
            <>
              <Paper variant="outlined" className={classes.importFile}>
                <Box display="flex" flex="1 1 auto" alignItems="center" justifyContent="center">
                  <Typography data-testid="observations-nodata" variant="body2" color="textSecondary">
                    No Observation Data. &nbsp;
                    <Link onClick={handleOpenImportObservations}>Click Here to Import</Link>
                  </Typography>
                </Box>
              </Paper>
            </>
          )}

          {/* No submission yet, but data is loading */}
          {!submissionExists && submissionDataLoader.isLoading && (
            <>
              <Paper variant="outlined" className={clsx(classes.importFile, submissionStatusSeverity)}>
                <Box flex="1 1 auto" style={{ overflow: 'hidden' }}>
                  <Box display="flex" alignItems="center" flex="1 1 auto" style={{ overflow: 'hidden' }}>
                    <Box className="importFile-icon" flex="0 0 auto" mr={2}>
                      <Icon path={submissionStatusIcon} size={1} />
                    </Box>
                    <Box mr={2} flex="1 1 auto" style={{ overflow: 'hidden' }}>
                      <Typography className={classes.observationFileName} variant="body2" component="div">
                        <strong>{fileName}</strong>
                      </Typography>
                    </Box>
                  </Box>

                  <Box ml={5} mr={1}>
                    <Typography variant="body2" color="textSecondary" component="div">
                      Importing file. Please wait...
                    </Typography>
                    <Box mt={1.5}>
                      <BorderLinearProgress />
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </>
          )}

          {/* Got a submission, but still loading */}
          {submissionExists && occurrenceSubmission?.isValidating && (
            <>
              <Paper variant="outlined" className={clsx(classes.importFile, submissionStatusSeverity)}>
                <Box flex="1 1 auto" style={{ overflow: 'hidden' }}>
                  <Box display="flex" alignItems="center" flex="1 1 auto" style={{ overflow: 'hidden' }}>
                    <Box className="importFile-icon" flex="0 0 auto" mr={2}>
                      <Icon path={submissionStatusIcon} size={1} />
                    </Box>
                    <Box flex="1 1 auto" style={{ overflow: 'hidden' }}>
                      <Typography
                        className={classes.observationFileName}
                        variant="body2"
                        component="div"
                        onClick={openFileContents}>
                        <strong>{occurrenceSubmission?.inputFileName}</strong>
                      </Typography>
                    </Box>
                  </Box>

                  <Box ml={5} mr={1}>
                    <Typography variant="body2" color="textSecondary" component="div">
                      {occurrenceSubmission?.isValidating
                        ? 'Importing file. Please wait...'
                        : occurrenceSubmission?.status}
                    </Typography>
                    <Box mt={1.5}>
                      <BorderLinearProgress />
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </>
          )}

          {/* All done */}
          {submissionExists && !occurrenceSubmission?.isValidating && (
            <>
              <Paper variant="outlined" className={clsx(classes.importFile, submissionStatusSeverity)}>
                <Box display="flex" alignItems="center" flex="1 1 auto" style={{ overflow: 'hidden' }}>
                  <Box display="flex" alignItems="center" flex="1 1 auto" style={{ overflow: 'hidden' }}>
                    <Box display="flex" alignItems="center" flex="0 0 auto" mr={2} className="importFile-icon">
                      <Icon path={submissionStatusIcon} size={1} />
                    </Box>
                    <Box mr={2} flex="1 1 auto" style={{ overflow: 'hidden' }}>
                      <Typography
                        className={classes.observationFileName}
                        variant="body2"
                        component="div"
                        onClick={openFileContents}>
                        <strong>{occurrenceSubmission?.inputFileName}</strong>
                      </Typography>
                    </Box>
                  </Box>

                  <Box flex="0 0 auto" display="flex" alignItems="center">
                    <Box mr={2}>
                      <SubmitStatusChip status={getSubmissionStatus(occurrenceSupplementaryData)} />
                    </Box>
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
                          horizontal: 'right'
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right'
                        }}>
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
                </Box>
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
          dropZoneProps={{ maxNumFiles: 1, acceptedFileExtensions: '.xls, .xlsm, .xlsx' }}
          uploadHandler={importObservations()}
        />
      </ComponentDialog>
    </>
  );
};

export default SurveyObservations;
