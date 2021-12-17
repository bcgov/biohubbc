import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import CircularProgress from '@material-ui/core/CircularProgress';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import {
  mdiAlertCircleOutline,
  mdiInformationOutline,
  mdiClockOutline,
  mdiFileOutline,
  mdiImport,
  mdiTrashCanOutline,
  mdiDownload
} from '@mdi/js';
import Icon from '@mdi/react';
import FileUpload from 'components/attachments/FileUpload';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { ConfigContext } from 'contexts/configContext';
import { DialogContext } from 'contexts/dialogContext';
import ObservationSubmissionCSV from 'features/observations/components/ObservationSubmissionCSV';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useInterval } from 'hooks/useInterval';
import { IGetObservationSubmissionResponse } from 'interfaces/useObservationApi.interface';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';

interface ISurveyObservationsProps {
  refresh: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  browseLink: {
    cursor: 'pointer'
  },
  alertLink: {
    color: 'inherit'
  },
  alertActions: {
    '& > *': {
      marginLeft: theme.spacing(2)
    }
  }
}));

export enum ClassGrouping {
  NOTICE = 'Notice',
  ERROR = 'Error',
  WARNING = 'Warning'
}

const finalStatus = ['Rejected', 'Darwin Core Validated', 'Template Validated', 'Template Transformed', 'System Error'];

const SurveyObservations: React.FC<ISurveyObservationsProps> = (props) => {
  const biohubApi = useBiohubApi();
  const urlParams = useParams();
  const config = useContext(ConfigContext);

  const projectId = urlParams['id'];
  const surveyId = urlParams['survey_id'];
  const [occurrenceSubmissionId, setOccurrenceSubmissionId] = useState<number | null>(null);
  const [openImportObservations, setOpenImportObservations] = useState(false);

  const classes = useStyles();

  const importObservations = (): IUploadHandler => {
    return (file, cancelToken, handleFileUploadProgress) => {
      return biohubApi.observation
        .uploadObservationSubmission(projectId, surveyId, file, cancelToken, handleFileUploadProgress)
        .then((result) => {
          if (!result || !result.submissionId) {
            return;
          }

          if (config?.N8N_HOST) {
            biohubApi.n8n.initiateOccurrenceSubmissionProcessing(projectId, result.submissionId, file.type);
            return;
          }

          if (file.type === 'application/x-zip-compressed' || file.type === 'application/zip') {
            biohubApi.observation.initiateDwCSubmissionValidation(projectId, result.submissionId).then(() => {
              biohubApi.observation.initiateScrapeOccurrences(projectId, result.submissionId).then(() => {
                props.refresh();
              });
            });
          } else {
            biohubApi.observation.initiateXLSXSubmissionValidation(projectId, result.submissionId).then(() => {
              biohubApi.observation.initiateXLSXSubmissionTransform(projectId, result.submissionId).then(() => {
                biohubApi.observation.initiateScrapeOccurrences(projectId, result.submissionId).then(() => {
                  props.refresh();
                });
              });
            });
          }
        });
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
        if (finalStatus.includes(submission.status)) {
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

  type MessageGrouping = { [key: string]: { type: string[]; label: string } };

  const messageGrouping: MessageGrouping = {
    mandatory: {
      type: ['Missing Required Field', 'Missing Required Header', 'Duplicate Header'],
      label: 'Mandatory fields have not been filled out'
    },
    recommended: {
      type: ['Missing Recommended Header'],
      label: 'Recommended fields have not been filled out'
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
    formatting_errors: {
      type: ['Unexpected Format'],
      label: 'Unexpected formats in the values provided'
    },
    miscellaneous: { type: ['Miscellaneous'], label: 'Miscellaneous errors exist in your file' },
    system_error: { type: ['Missing Validation Schema'], label: 'Contact your system administrator' }
  };

  type SubmissionErrors = { [key: string]: string[] };
  type SubmissionWarnings = { [key: string]: string[] };

  const submissionErrors: SubmissionErrors = {};
  const submissionWarnings: SubmissionWarnings = {};

  const messageList = submissionStatus?.messages;

  if (messageList) {
    Object.entries(messageGrouping).forEach(([key, value]) => {
      messageList.forEach((message) => {
        if (value.type.includes(message.type)) {
          if (message.class === ClassGrouping.ERROR) {
            if (!submissionErrors[key]) {
              submissionErrors[key] = [];
            }
            submissionErrors[key].push(message.message);
          }

          if (message.class === ClassGrouping.WARNING) {
            if (!submissionWarnings[key]) {
              submissionWarnings[key] = [];
            }

            submissionWarnings[key].push(message.message);
          }
        }
      });
    });
  }

  const viewFileContents = async () => {
    if (!occurrenceSubmissionId) {
      return;
    }

    let response;

    try {
      response = await biohubApi.survey.getObservationSubmissionSignedURL(projectId, surveyId, occurrenceSubmissionId);
    } catch {
      return;
    }

    if (!response) {
      return;
    }

    window.open(response);
  };

  if (isLoading) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  type severityLevel = 'error' | 'info' | 'success' | 'warning' | undefined;

  function displayAlertBox(severityLevel: severityLevel, iconName: string, fileName: string, message: string) {
    return (
      <Alert icon={<Icon path={iconName} size={1} />} severity={severityLevel} action={submissionAlertAction()}>
        <Box display="flex" alignItems="center" m={0}>
          <Link className={classes.alertLink} component="button" variant="body2" onClick={() => viewFileContents()}>
            <strong>{fileName}</strong>
          </Link>
        </Box>
        <Typography variant="body2">{message}</Typography>
      </Alert>
    );
  }

  function displayMessages(list: SubmissionErrors | SubmissionWarnings, msgGroup: MessageGrouping, iconName: string) {
    return (
      <Box>
        {Object.entries(list).map(([key, value], index) => (
          <Box key={index}>
            <Alert severity="error">{msgGroup[key].label}</Alert>
            <Box component="ul" my={3}>
              {value.map((message: string, index2: number) => {
                return (
                  <li key={`${index}-${index2}`}>
                    <Typography variant="body2">{message}</Typography>
                  </li>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <>
      <Paper>
        <H2ButtonToolbar
          label="Observations"
          buttonLabel="Import"
          buttonTitle="Import"
          buttonStartIcon={<Icon path={mdiImport} size={1} />}
          buttonOnClick={() => showUploadDialog()}
        />

        <Box>
          {!submissionStatus && (
            <>
              <Box component={Divider} m={0} />
              <Box p={3} textAlign="center">
                <Typography data-testid="observations-nodata" variant="body2">
                  No Observation Data. &nbsp;
                  <Link onClick={() => setOpenImportObservations(true)} className={classes.browseLink}>
                    Click Here to Import
                  </Link>
                </Typography>
              </Box>
            </>
          )}

          {!isValidating && submissionStatus?.status === 'System Error' && (
            <Box px={3} pb={3}>
              {displayAlertBox(
                'error',
                mdiAlertCircleOutline,
                submissionStatus.inputFileName,
                'Validation Failed to Start'
              )}
              <Box my={3}>
                <Typography data-testid="observations-error-details" variant="body1">
                  Resolve the following errors in your local file and re-import.
                </Typography>
              </Box>
              <Box>
                {displayMessages(submissionErrors, messageGrouping, mdiAlertCircleOutline)}
                {displayMessages(submissionWarnings, messageGrouping, mdiInformationOutline)}
              </Box>
            </Box>
          )}

          {!isValidating && submissionStatus?.status === 'Rejected' && (
            <Box px={3} pb={3}>
              {displayAlertBox('error', mdiAlertCircleOutline, submissionStatus.inputFileName, 'Validation Failed')}
              <Box my={3}>
                <Typography data-testid="observations-error-details" variant="body1">
                  Resolve the following errors in your local file and re-import.
                </Typography>
              </Box>
              <Box>
                {displayMessages(submissionErrors, messageGrouping, mdiAlertCircleOutline)}
                {displayMessages(submissionWarnings, messageGrouping, mdiInformationOutline)}
              </Box>
            </Box>
          )}
          {!isValidating &&
            submissionStatus &&
            (submissionStatus.status === 'Darwin Core Validated' ||
              submissionStatus.status === 'Template Validated') && (
              <>
                <Box px={3}>{displayAlertBox('info', mdiFileOutline, submissionStatus.inputFileName, '')}</Box>
                <Box mt={1} overflow="hidden">
                  <ObservationSubmissionCSV
                    getCSVData={() => {
                      return biohubApi.observation.getSubmissionCSVForView(projectId, surveyId, submissionStatus.id);
                    }}
                  />
                </Box>
              </>
            )}
          {isValidating && submissionStatus && (
            <Box px={3} pb={3}>
              {displayAlertBox(
                'info',
                mdiClockOutline,
                submissionStatus?.inputFileName,
                'Validating observation data. Please wait ...'
              )}
            </Box>
          )}
        </Box>
      </Paper>

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
    </>
  );
};

export default SurveyObservations;
