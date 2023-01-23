import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import {
  mdiAlertCircleOutline,
  mdiClockOutline,
  mdiDownload,
  mdiFileOutline,
  mdiInformationOutline,
  mdiPlus,
  mdiTrashCanOutline
} from '@mdi/js';
import Icon from '@mdi/react';
import ComponentDialog from 'components/dialog/ComponentDialog';
import FileUpload from 'components/file-upload/FileUpload';
import { IUploadHandler } from 'components/file-upload/FileUploadItem';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { DialogContext } from 'contexts/dialogContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useInterval } from 'hooks/useInterval';
import {
  IUploadObservationSubmissionResponse,
  ObservationSubmissionMessageSeverityLabel
} from 'interfaces/useObservationApi.interface';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';

interface ISurveyObservationsProps {
  refresh: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  alertLink: {
    color: 'inherit'
  },
  alertActions: {
    '& > *': {
      marginLeft: theme.spacing(2)
    }
  }
}));

const SurveyObservations: React.FC<ISurveyObservationsProps> = (props) => {
  const biohubApi = useBiohubApi();
  const urlParams = useParams();
  const dialogContext = useContext(DialogContext);
  const classes = useStyles();
  const [openImportObservations, setOpenImportObservations] = useState(false);

  const projectId = Number(urlParams['id']);
  const surveyId = Number(urlParams['survey_id']);

  const submissionDataLoader = useDataLoader(() => biohubApi.observation.getObservationSubmission(projectId, surveyId));

  submissionDataLoader.load();

  const refreshSubmission = submissionDataLoader.refresh;
  const occurrenceSubmission = submissionDataLoader.data;
  const occurrenceSubmissionId = occurrenceSubmission?.id;
  const submissionMessageTypes = occurrenceSubmission?.messageTypes || [];
  const submissionExists = Boolean(occurrenceSubmission);

  const submissionPollingInterval = useInterval(refreshSubmission, 5000, 60000);

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

  // TODO
  /*
  useEffect(() => {
    if (!openImportObservations && (submissionDataLoader.isReady || submissionDataLoader.isLoading)) {
      refreshSubmission();
    }
  }, [openImportObservations, submissionDataLoader])
  */

  const defaultUploadYesNoDialogProps = {
    dialogTitle: 'Upload Observation Data',
    dialogText:
      'Are you sure you want to import a different data set?  This will overwrite the existing data you have already imported.',
    open: false,
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false }),
    onYes: () => dialogContext.setYesNoDialog({ open: false })
  };

  const defaultDeleteYesNoDialogProps = {
    ...defaultUploadYesNoDialogProps,
    dialogTitle: 'Delete Observation',
    dialogText:
      'Are you sure you want to delete the current observation data? Your observation will be removed from this survey.'
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
            biohubApi.observation.processDWCFile(projectId, result.submissionId).then(props.refresh);
          } else {
            biohubApi.observation.processOccurrences(projectId, result.submissionId, surveyId);
          }
        });
    };
  };

  const softDeleteSubmission = () => {
    if (!occurrenceSubmissionId) {
      return;
    }

    biohubApi.observation.deleteObservationSubmission(projectId, surveyId, occurrenceSubmissionId).then(() => {
      props.refresh();
      refreshSubmission();
    });
  };

  const showUploadDialog = () => {
    if (submissionExists) {
      dialogContext.setYesNoDialog({
        ...defaultUploadYesNoDialogProps,
        open: true,
        onYes: () => {
          setOpenImportObservations(true);
          dialogContext.setYesNoDialog({ open: false });
        }
      });
    } else {
      setOpenImportObservations(true);
    }
  };

  const showDeleteDialog = () => {
    dialogContext.setYesNoDialog({
      ...defaultDeleteYesNoDialogProps,
      open: true,
      onYes: () => {
        softDeleteSubmission();
        dialogContext.setYesNoDialog({ open: false });
      }
    });
  };

  const submissionAlertAction = () => (
    <Box>
      <IconButton aria-label="open" color="inherit" onClick={() => viewFileContents()}>
        <Icon path={mdiDownload} size={1} />
      </IconButton>
      <IconButton aria-label="delete" color="inherit" onClick={() => showDeleteDialog()}>
        <Icon path={mdiTrashCanOutline} size={1} />
      </IconButton>
    </Box>
  );

  const viewFileContents = () => {
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
  };

  if (submissionDataLoader.isLoading) {
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

  let submissionStatusIcon = occurrenceSubmission?.isValidating ? mdiClockOutline : mdiFileOutline;
  let submissionStatusSeverity: AlertSeverityLevel = 'info';

  if (submissionMessageTypes.some((messageType) => messageType.severityLabel === 'Error')) {
    submissionStatusIcon = mdiAlertCircleOutline;
    submissionStatusSeverity = 'error';
  } else if (submissionMessageTypes.some((messageType) => messageType.severityLabel === 'Warning')) {
    submissionStatusIcon = mdiAlertCircleOutline;
    submissionStatusSeverity = 'warning';
  } else if (submissionMessageTypes.some((messageType) => messageType.severityLabel === 'Notice')) {
    submissionStatusIcon = mdiInformationOutline;
  }

  return (
    <>
      <Paper elevation={0}>
        <H2ButtonToolbar
          label="Observations"
          buttonLabel="Import Observations"
          buttonTitle="Import Observations"
          buttonProps={{ variant: 'contained', color: 'primary' }}
          buttonStartIcon={<Icon path={mdiPlus} size={0.8} />}
          buttonOnClick={() => showUploadDialog()}
        />

        <Divider />

        <Box p={3}>
          {!submissionExists ? (
            <>
              <Box textAlign="center">
                <Typography data-testid="observations-nodata" variant="body2" color="textSecondary">
                  No Observation Data. &nbsp;
                  <Link onClick={() => setOpenImportObservations(true)}>Click Here to Import</Link>
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <Alert
                icon={<Icon path={submissionStatusIcon} size={1} />}
                severity={submissionStatusSeverity}
                action={submissionAlertAction()}>
                <Box display="flex" alignItems="center" m={0}>
                  <Link
                    className={classes.alertLink}
                    component="button"
                    variant="body2"
                    onClick={() => viewFileContents()}>
                    <strong>{occurrenceSubmission?.inputFileName}</strong>
                  </Link>
                </Box>
                <Typography variant="body2">
                  {occurrenceSubmission?.isValidating
                    ? 'Validating observation data. Please wait...'
                    : occurrenceSubmission?.status}
                </Typography>
              </Alert>

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
                      {submissionMessageTypes.map((messageType) => {
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
                      })}
                    </Box>
                  )}
                </>
              )}
            </>
          )}
        </Box>
      </Paper>

      <ComponentDialog
        open={openImportObservations}
        dialogTitle="Import Observation Data"
        onClose={() => {
          setOpenImportObservations(false);
        }}>
        <FileUpload
          dropZoneProps={{ maxNumFiles: 1, acceptedFileExtensions: '.csv, .xls, .txt, .zip, .xlsm, .xlsx' }}
          uploadHandler={importObservations()}
        />
      </ComponentDialog>
    </>
  );
};

export default SurveyObservations;
