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
  mdiTrayArrowUp,
  mdiInformationOutline,
  mdiTrashCanOutline
} from '@mdi/js';
import Icon from '@mdi/react';
import FileUpload from 'components/attachments/FileUpload';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
// import { ConfigContext } from 'contexts/configContext';
import { DialogContext } from 'contexts/dialogContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useInterval } from 'hooks/useInterval';
import { IGetObservationSubmissionResponse } from 'interfaces/useObservationApi.interface';
import React, { useCallback, useContext, useEffect, useState } from 'react';
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

export enum ClassGrouping {
  NOTICE = 'Notice',
  ERROR = 'Error',
  WARNING = 'Warning'
}

const finalStatus = [
  'Rejected',
  'Darwin Core Validated',
  'Template Validated',
  'Template Transformed',
  'System Error',
  'Failed to prepare submission',
  'Media is not valid',
  'Failed to validate',
  'Failed to transform',
  'Failed to process occurrence data'
];

export enum SUBMISSION_STATUS_TYPE {
  SUBMITTED = 'Submitted',
  'TEMPLATE_VALIDATED' = 'Template Validated',
  'DARWIN_CORE_VALIDATED' = 'Darwin Core Validated',
  'TEMPLATE_TRANSFORMED' = 'Template Transformed',
  'SUBMISSION_DATA_INGESTED' = 'Submission Data Ingested',
  'SECURED' = 'Secured',
  'AWAITING CURRATION' = 'Awaiting Curration',
  'REJECTED' = 'Rejected',
  'ON HOLD' = 'On Hold',
  'SYSTEM_ERROR' = 'System Error',

  //Failure
  'FAILED_OCCURRENCE_PREPARATION' = 'Failed to prepare submission',
  'INVALID_MEDIA' = 'Media is not valid',
  'FAILED_VALIDATION' = 'Failed to validate',
  'FAILED_TRANSFORMED' = 'Failed to transform',
  'FAILED_PROCESSING_OCCURRENCE_DATA' = 'Failed to process occurrence data'
}

export enum SUBMISSION_MESSAGE_TYPE {
  //message types that match the submission_message_type table, and API

  'DUPLICATE_HEADER' = 'Duplicate header',
  'UNKNOWN_HEADER' = 'Unknown Header',
  'MISSING_REQUIRED_HEADER' = 'Missing Required Header',
  'MISSING_RECOMMENDED_HEADER' = 'Missing Recommended Header',
  'MISCELLANEOUS' = 'Miscellaneous',
  'MISSING_REQUIRED_FIELD' = 'Missing Required Field',
  'UNEXPECTED_FORMAT' = 'Unexpected Format',
  'OUT_OF_RANGE' = 'Out of Range',
  'INVALID_VALUE' = 'Invalid Value',
  'MISSING_VALIDATION_SCHEMA' = 'Missing Validation Schema',
  'ERROR' = 'Error',
  'PARSE_ERROR' = 'Parse error',

  'FAILED_GET_OCCURRENCE' = 'Failed to Get Occurrence Submission',
  'FAILED_GET_FILE_FROM_S3' = 'Failed to get file from S3',
  'FAILED_UPLOAD_FILE_TO_S3' = 'Failed to upload file to S3',
  'FAILED_PARSE_SUBMISSION' = 'Failed to parse submission',
  'FAILED_PREP_DWC_ARCHIVE' = 'Failed to prep DarwinCore Archive',
  'FAILED_PREP_XLSX' = 'Failed to prep XLSX',
  'FAILED_PERSIST_PARSE_ERRORS' = 'Failed to persist parse errors',
  'FAILED_GET_VALIDATION_RULES' = 'Failed to get validation rules',
  'FAILED_GET_TRANSFORMATION_RULES' = 'Failed to get transformation rules',
  'FAILED_PERSIST_TRANSFORMATION_RESULTS' = 'Failed to persist transformation results',
  'FAILED_TRANSFORM_XLSX' = 'Failed to transform XLSX',
  'FAILED_VALIDATE_DWC_ARCHIVE' = 'Failed to validate DarwinCore Archive',
  'FAILED_PERSIST_VALIDATION_RESULTS' = 'Failed to persist validation results',
  'FAILED_UPDATE_OCCURRENCE_SUBMISSION' = 'Failed to update occurrence submission',
  'FAILED_TO_GET_TRANSFORM_SCHEMA' = 'Unable to get transform schema for submission',
  'INVALID_MEDIA' = 'Media is invalid',
  'UNSUPPORTED_FILE_TYPE' = 'File submitted is not a supported type'
}

const SurveyObservations: React.FC<ISurveyObservationsProps> = (props) => {
  const biohubApi = useBiohubApi();
  const urlParams = useParams();
  // const config = useContext(ConfigContext);

  const projectId = Number(urlParams['id']);
  const surveyId = Number(urlParams['survey_id']);
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

          if (file.type === 'application/x-zip-compressed' || file.type === 'application/zip') {
            biohubApi.observation.processDWCFile(projectId, result.submissionId).then(() => {
              props.refresh();
            });
          } else {
            biohubApi.observation.processOccurrences(projectId, result.submissionId, surveyId);
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

  useInterval(fetchObservationSubmission, pollingTime, 60000);

  useEffect(() => {
    if (isLoading) {
      fetchObservationSubmission();
    }

    if (isPolling && !pollingTime) {
      setPollingTime(5000);
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

  // Action prop for the Alert MUI component to render the delete icon and associated actions
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
      type: [
        SUBMISSION_MESSAGE_TYPE.MISSING_REQUIRED_FIELD,
        SUBMISSION_MESSAGE_TYPE.MISSING_REQUIRED_HEADER,
        SUBMISSION_MESSAGE_TYPE.DUPLICATE_HEADER
      ],
      label: 'Mandatory fields have not been filled out'
    },
    recommended: {
      type: [SUBMISSION_MESSAGE_TYPE.MISSING_RECOMMENDED_HEADER],
      label: 'Recommended fields have not been filled out'
    },
    value_not_from_list: {
      type: [SUBMISSION_MESSAGE_TYPE.INVALID_VALUE],
      label: "Values have not been selected from the field's dropdown list"
    },
    unsupported_header: {
      type: [SUBMISSION_MESSAGE_TYPE.UNKNOWN_HEADER],
      label: 'Column headers are not supported'
    },
    out_of_range: {
      type: [SUBMISSION_MESSAGE_TYPE.OUT_OF_RANGE],
      label: 'Values are out of range'
    },
    formatting_errors: {
      type: [SUBMISSION_MESSAGE_TYPE.UNEXPECTED_FORMAT],
      label: 'Unexpected formats in the values provided'
    },
    miscellaneous: { type: [SUBMISSION_MESSAGE_TYPE.MISCELLANEOUS], label: 'Miscellaneous errors exist in your file' },
    system_error: {
      type: [
        SUBMISSION_MESSAGE_TYPE.FAILED_GET_FILE_FROM_S3,
        SUBMISSION_MESSAGE_TYPE.ERROR,
        SUBMISSION_MESSAGE_TYPE.PARSE_ERROR,
        SUBMISSION_MESSAGE_TYPE.FAILED_GET_OCCURRENCE,
        SUBMISSION_MESSAGE_TYPE.FAILED_UPLOAD_FILE_TO_S3,
        SUBMISSION_MESSAGE_TYPE.FAILED_PARSE_SUBMISSION,
        SUBMISSION_MESSAGE_TYPE.FAILED_PREP_DWC_ARCHIVE,
        SUBMISSION_MESSAGE_TYPE.FAILED_PREP_XLSX,
        SUBMISSION_MESSAGE_TYPE.FAILED_PERSIST_PARSE_ERRORS,
        SUBMISSION_MESSAGE_TYPE.FAILED_GET_VALIDATION_RULES,
        SUBMISSION_MESSAGE_TYPE.FAILED_GET_TRANSFORMATION_RULES,
        SUBMISSION_MESSAGE_TYPE.FAILED_PERSIST_TRANSFORMATION_RESULTS,
        SUBMISSION_MESSAGE_TYPE.FAILED_TRANSFORM_XLSX,
        SUBMISSION_MESSAGE_TYPE.FAILED_VALIDATE_DWC_ARCHIVE,
        SUBMISSION_MESSAGE_TYPE.FAILED_PERSIST_VALIDATION_RESULTS,
        SUBMISSION_MESSAGE_TYPE.FAILED_UPDATE_OCCURRENCE_SUBMISSION,
        SUBMISSION_MESSAGE_TYPE.FAILED_TO_GET_TRANSFORM_SCHEMA,
        SUBMISSION_MESSAGE_TYPE.UNSUPPORTED_FILE_TYPE,
        SUBMISSION_MESSAGE_TYPE.INVALID_MEDIA,
        SUBMISSION_MESSAGE_TYPE.MISSING_VALIDATION_SCHEMA
      ],
      label: 'Contact your system administrator'
    }
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
      <Paper elevation={0}>
        <H2ButtonToolbar
          label="Observations"
          buttonLabel="Submit Observations"
          buttonTitle="Submit Observations"
          buttonProps={{variant: 'contained', color: 'primary'}}
          buttonStartIcon={<Icon path={mdiTrayArrowUp} size={0.8} />}
          buttonOnClick={() => showUploadDialog()}
        />

        <Divider></Divider>

        <Box p={3}>
          {!submissionStatus && (
            <>
              <Box textAlign="center">
                <Typography data-testid="observations-nodata" variant="body2" color="textSecondary">
                  No Observation Data. &nbsp;
                  <Link onClick={() => setOpenImportObservations(true)}>
                    Click Here to Import
                  </Link>
                </Typography>
              </Box>
            </>
          )}

          {!isValidating && submissionStatus?.status === SUBMISSION_STATUS_TYPE.SYSTEM_ERROR && (
            <Box>
              {displayAlertBox(
                'error',
                mdiAlertCircleOutline,
                submissionStatus.inputFileName,
                SUBMISSION_STATUS_TYPE.SYSTEM_ERROR
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

          {!isValidating &&
            (submissionStatus?.status === SUBMISSION_STATUS_TYPE.REJECTED ||
            submissionStatus?.status === SUBMISSION_STATUS_TYPE.FAILED_OCCURRENCE_PREPARATION ||
            submissionStatus?.status === SUBMISSION_STATUS_TYPE.INVALID_MEDIA ||
            submissionStatus?.status === SUBMISSION_STATUS_TYPE.FAILED_VALIDATION ||
            submissionStatus?.status === SUBMISSION_STATUS_TYPE.FAILED_TRANSFORMED ||
            submissionStatus?.status === SUBMISSION_STATUS_TYPE.FAILED_PROCESSING_OCCURRENCE_DATA) && (
            <Box>
              {displayAlertBox(
                'error',
                mdiAlertCircleOutline,
                submissionStatus.inputFileName,
                `Validation error: ${submissionStatus?.status}`
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

          {!isValidating &&
            submissionStatus &&
            (submissionStatus.status === SUBMISSION_STATUS_TYPE.DARWIN_CORE_VALIDATED ||
            submissionStatus.status === SUBMISSION_STATUS_TYPE.TEMPLATE_VALIDATED ||
            submissionStatus.status === SUBMISSION_STATUS_TYPE.TEMPLATE_TRANSFORMED) && (
            <Box px={3}>
              {displayAlertBox(
                'info',
                mdiFileOutline,
                submissionStatus.inputFileName,
                ''
              )}
            </Box>
          )}

          {isValidating && submissionStatus && (
            <Box>
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
