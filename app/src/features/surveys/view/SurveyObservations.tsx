import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import { mdiAlertCircleOutline, mdiClockOutline, mdiFileOutline, mdiImport, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import FileUpload from 'components/attachments/FileUpload';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { DialogContext } from 'contexts/dialogContext';
import ObservationSubmissionCSV from 'features/observations/components/ObservationSubmissionCSV';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useInterval } from 'hooks/useInterval';
import { IGetObservationSubmissionResponse } from 'interfaces/useObservationApi.interface';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';

const useStyles = makeStyles((theme: Theme) => ({
  textSpacing: {
    marginBottom: '1rem'
  },
  browseLink: {
    cursor: 'pointer'
  },
  center: {
    alignSelf: 'center'
  },
  box: {
    width: '100%',
    background: 'rgba(241, 243, 245, 1)',
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    minHeight: '3rem'
  },
  infoBox: {
    background: 'rgba(241, 243, 245, 1)'
  },
  tab: {
    paddingLeft: theme.spacing(2)
  },
  nested: {
    paddingLeft: theme.spacing(4)
  }
}));

const SurveyObservations = () => {
  const biohubApi = useBiohubApi();
  const urlParams = useParams();

  const projectId = urlParams['id'];
  const surveyId = urlParams['survey_id'];
  const [occurrenceSubmissionId, setOccurrenceSubmissionId] = useState<number | null>(null);
  const [openImportObservations, setOpenImportObservations] = useState(false);

  const classes = useStyles();

  const importObservations = (): IUploadHandler => {
    return (files, cancelToken, handleFileUploadProgress) => {
      return biohubApi.observation.uploadObservationSubmission(
        projectId,
        surveyId,
        files[0],
        cancelToken,
        handleFileUploadProgress
      );
    };
  };

  const [submissionStatus, setSubmissionStatus] = useState<IGetObservationSubmissionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingTime, setPollingTime] = useState<number | null>(0);

  const dialogContext = useContext(DialogContext);

  const fetchObservationSubmission = useCallback(async () => {
    const submission = await biohubApi.observation.getObservationSubmission(projectId, surveyId);

    setSubmissionStatus(() => {
      setIsLoading(false);
      if (submission) {
        if (
          submission.status === 'Rejected' ||
          submission.status === 'Darwin Core Validated' ||
          submission.status === 'Template Validated'
        ) {
          setIsValidating(false);
          setIsPolling(false);

          setPollingTime(null);
        } else {
          setIsValidating(true);
          setIsPolling(true);
        }

        setOccurrenceSubmissionId(submission.id);
      }

      return submission;
    });
  }, [biohubApi.observation, projectId, surveyId]);

  useInterval(fetchObservationSubmission, pollingTime);

  useEffect(() => {
    if (isLoading) {
      fetchObservationSubmission();
    }

    if (isPolling && !pollingTime) {
      setPollingTime(2000);
    }
  }, [
    biohubApi,
    isLoading,
    fetchObservationSubmission,
    isPolling,
    pollingTime,
    isValidating,
    submissionStatus,
    projectId,
    surveyId
  ]);

  const softDeleteSubmission = async () => {
    if (!occurrenceSubmissionId) {
      return;
    }

    await biohubApi.observation.deleteObservationSubmission(projectId, surveyId, occurrenceSubmissionId);

    fetchObservationSubmission();
  };

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

  const showUploadDialog = () => {
    if (submissionStatus) {
      // already have observation data, prompt user to confirm override
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

  // Action prop for the Alert MUI component to render the delete icon and associated action
  const deleteSubmissionAlertAction = () => (
    <IconButton aria-label="close" color="inherit" size="small" onClick={() => showDeleteDialog()}>
      <Icon path={mdiTrashCanOutline} size={1} />
    </IconButton>
  );

  type MessageGrouping = { [key: string]: { type: string[]; label: string } };

  const messageGrouping: MessageGrouping = {
    mandatory: {
      type: ['Missing Required Field', 'Missing Required Header'],
      label: 'Mandatory fields have not been filled out'
    },
    value_not_from_list: {
      type: ['Invalid Value'],
      label: "Values have not been selected from the field's dropdown list"
    },
    unsupported_header: {
      type: ['Unknown Header'],
      label: 'Column headers are not supported'
    },
    out_of_range: {
      type: ['Out of Range'],
      label: 'Values are out of range'
    },
    miscellaneous: { type: ['Miscellaneous'], label: 'Miscellaneous errors exist in your file' }
  };

  type SubmissionMessages = { [key: string]: string[] };

  const submissionMessages: SubmissionMessages = {};

  const messageList = submissionStatus?.messages;

  if (messageList) {
    Object.entries(messageGrouping).forEach(([key, value]) => {
      messageList.forEach((message) => {
        if (value.type.includes(message.type)) {
          if (!submissionMessages[key]) {
            submissionMessages[key] = [];
          }

          submissionMessages[key].push(message.message);
        }
      });
    });
  }

  if (isLoading) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <Box>
      <Box mb={5} display="flex" justifyContent="space-between">
        <Typography data-testid="observations-heading" variant="h2">
          Observations
        </Typography>
        <Button
          startIcon={<Icon path={mdiImport} size={1} />}
          variant="outlined"
          color="primary"
          onClick={() => showUploadDialog()}>
          Import
        </Button>
      </Box>

      <Box component={Paper} p={4}>
        {!submissionStatus && (
          <Typography data-testid="observations-nodata" variant="body2" className={`${classes.infoBox} ${classes.box}`}>
            No Observation Data. &nbsp;
            <Link onClick={() => setOpenImportObservations(true)} className={classes.browseLink}>
              Click Here to Import
            </Link>
          </Typography>
        )}
        {!isValidating && submissionStatus?.status === 'Rejected' && (
          <>
            <Alert severity="error" action={deleteSubmissionAlertAction()}>
              <AlertTitle>{submissionStatus.fileName}</AlertTitle>
              Validation Failed
            </Alert>

            <Box mt={3} mb={1}>
              <Typography data-testid="observations-error-details" variant="h4" className={classes.center}>
                What's next?
              </Typography>
            </Box>
            <Box mb={3}>
              <Typography data-testid="observations-error-details" variant="body2" className={classes.center}>
                Resolve the following errors in your local file and re-import.
              </Typography>
            </Box>
            <Box>
              {Object.entries(submissionMessages).map(([key, value], index) => {
                return (
                  <Box>
                    <Box display="flex" alignItems="center">
                      <Icon path={mdiAlertCircleOutline} size={1} color="#ff5252" />{' '}
                      <strong className={classes.tab}>{messageGrouping[key].label}</strong>
                    </Box>
                    <Box pl={2}>
                      <ul>
                        {value.map((message: string, index2: number) => {
                          return <li key={`${index}-${index2}`}>{message}</li>;
                        })}
                      </ul>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </>
        )}
        {!isValidating &&
          (submissionStatus?.status === 'Darwin Core Validated' ||
            submissionStatus?.status === 'Template Validated') && (
            <>
              <Alert
                icon={<Icon path={mdiFileOutline} size={1} />}
                severity="info"
                action={deleteSubmissionAlertAction()}>
                <AlertTitle>{submissionStatus.fileName}</AlertTitle>
              </Alert>

              <Box mt={5} overflow="hidden">
                <ObservationSubmissionCSV submissionId={submissionStatus.id} />
              </Box>
            </>
          )}
        {isValidating && (
          <>
            <Alert
              icon={<Icon path={mdiClockOutline} size={1} />}
              severity="info"
              action={deleteSubmissionAlertAction()}>
              <AlertTitle>{submissionStatus?.fileName}</AlertTitle>
              Validating observation data. Please wait ...
            </Alert>
          </>
        )}
      </Box>

      <ComponentDialog
        open={openImportObservations}
        dialogTitle="Import Observation Data"
        onClose={() => {
          setOpenImportObservations(false);
          setIsPolling(true);
          setIsLoading(true);
        }}>
        <FileUpload
          dropZoneProps={{ maxNumFiles: 1, acceptedFileExtensions: '.csv, .xls, .txt, .zip, .xlsm, .xlsx' }}
          uploadHandler={importObservations()}
        />
      </ComponentDialog>
    </Box>
  );
};

export default SurveyObservations;
