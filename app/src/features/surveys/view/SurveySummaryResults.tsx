import Box from '@material-ui/core/Box';
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
  mdiDownload,
  mdiFileOutline,
  mdiImport,
  mdiInformationOutline,
  mdiTrashCanOutline
} from '@mdi/js';
import Icon from '@mdi/react';
import { SubmitStatusChip } from 'components/chips/SubmitStatusChip';
import ComponentDialog from 'components/dialog/ComponentDialog';
import FileUpload from 'components/file-upload/FileUpload';
import { IUploadHandler } from 'components/file-upload/FileUploadItem';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { BioHubSubmittedStatusType } from 'constants/misc';
import { DialogContext } from 'contexts/dialogContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import useDataLoaderError from 'hooks/useDataLoaderError';
import { ISurveySummarySupplementaryData } from 'interfaces/useSummaryResultsApi.interface';
import React, { useContext, useState } from 'react';
import { useParams } from 'react-router';

const useStyles = makeStyles((theme: Theme) => ({
  browseLink: {
    cursor: 'pointer'
  },
  center: {
    alignSelf: 'center'
  },
  alertLink: {
    color: 'inherit'
  },
  alertActions: {
    '& > *': {
      marginLeft: theme.spacing(0.5)
    }
  }
}));

export enum ClassGrouping {
  NOTICE = 'Notice',
  ERROR = 'Error',
  WARNING = 'Warning'
}

const SurveySummaryResults = () => {
  const biohubApi = useBiohubApi();
  const urlParams = useParams();
  const dialogContext = useContext(DialogContext);
  const classes = useStyles();

  const projectId = urlParams['id'];
  const surveyId = urlParams['survey_id'];
  const [openImportSummaryResults, setOpenImportSummaryResults] = useState(false);

  const importSummaryResults = (): IUploadHandler => {
    return (file, cancelToken, handleFileUploadProgress) => {
      return biohubApi.survey.uploadSurveySummaryResults(
        projectId,
        surveyId,
        file,
        cancelToken,
        handleFileUploadProgress
      );
    };
  };

  const defaultUploadYesNoDialogProps = {
    dialogTitle: 'Upload Summary Results Data',
    dialogText:
      'Are you sure you want to import a different data set?  This will overwrite the existing data you have already imported.',
    open: false,
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false }),
    onYes: () => dialogContext.setYesNoDialog({ open: false })
  };

  const defaultDeleteYesNoDialogProps = {
    ...defaultUploadYesNoDialogProps,
    dialogTitle: 'Delete Summary Results Data',
    dialogText:
      'Are you sure you want to delete the summary results data? Your summary results will be removed from this survey.'
  };

  //Summary Data Loader and Error Handling
  const summaryDataLoader = useDataLoader(() => biohubApi.survey.getSurveySummarySubmission(projectId, surveyId));
  useDataLoaderError(summaryDataLoader, () => {
    return {
      dialogTitle: 'Error Loading Summary Details',
      dialogText:
        'An error has occurred while attempting to load summary details, please try again. If the error persists, please contact your system administrator.'
    };
  });

  summaryDataLoader.load();
  const summaryData = summaryDataLoader.data?.surveySummaryData;

  const softDeleteSubmission = async () => {
    if (!summaryData?.survey_summary_submission_id) {
      return;
    }

    await biohubApi.survey.deleteSummarySubmission(projectId, surveyId, summaryData?.survey_summary_submission_id);

    summaryDataLoader.refresh();
  };

  const showUploadDialog = () => {
    if (summaryData) {
      // already have summary data, prompt user to confirm override
      dialogContext.setYesNoDialog({
        ...defaultUploadYesNoDialogProps,
        open: true,
        onYes: () => {
          setOpenImportSummaryResults(true);
          dialogContext.setYesNoDialog({ open: false });
        }
      });
    } else {
      setOpenImportSummaryResults(true);
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

  const checkSubmissionStatus = (
    supplementaryData: ISurveySummarySupplementaryData | null | undefined
  ): BioHubSubmittedStatusType => {
    if (supplementaryData?.event_timestamp) {
      return BioHubSubmittedStatusType.SUBMITTED;
    }
    return BioHubSubmittedStatusType.UNSUBMITTED;
  };

  //Action prop for the Alert MUI component to render the delete icon and associated action
  const submissionAlertAction = () => (
    <Box className={classes.alertActions}>
      <SubmitStatusChip status={checkSubmissionStatus(summaryDataLoader.data?.surveySummarySupplementaryData)} />
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
    system_error: {
      type: ['Missing Validation Schema', 'Failed to Get Validation Rules'],
      label: 'Contact your system administrator'
    }
  };

  type SubmissionErrors = { [key: string]: string[] };
  type SubmissionWarnings = { [key: string]: string[] };

  const submissionErrors: SubmissionErrors = {};
  const submissionWarnings: SubmissionWarnings = {};

  const messageList = summaryData?.messages;

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
    if (!summaryData) {
      return;
    }

    let response;

    try {
      response = await biohubApi.survey.getSummarySubmissionSignedURL(
        projectId,
        surveyId,
        summaryData?.survey_summary_submission_id
      );
    } catch {
      return;
    }

    if (!response) {
      return;
    }

    window.open(response);
  };

  type severityLevel = 'error' | 'info' | 'success' | 'warning' | undefined;

  function displayAlertBox(severityLevel: severityLevel, iconName: string, fileName: string, message: string) {
    return (
      <Alert icon={<Icon path={iconName} size={1} />} severity={severityLevel} action={submissionAlertAction()}>
        <Box display="flex" alignItems="center" m={0}>
          <Link
            className={classes.alertLink}
            component="button"
            variant="body2"
            onClick={() => viewFileContents()}
            gutterBottom={false}>
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
          <Box key={index} pl={0.25}>
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
          label="Summary Results"
          buttonProps={{ variant: 'contained', color: 'primary' }}
          buttonLabel="Import"
          buttonTitle="Import Summary Results"
          buttonStartIcon={<Icon path={mdiImport} size={1} />}
          buttonOnClick={() => showUploadDialog()}
        />

        <Divider></Divider>

        <Box p={3}>
          {!summaryData && (
            <Box textAlign="center">
              <Typography data-testid="observations-nodata" variant="body2" color="textSecondary">
                No Summary Results. &nbsp;
                <Link onClick={() => setOpenImportSummaryResults(true)} className={classes.browseLink}>
                  Click Here to Import
                </Link>
              </Typography>
            </Box>
          )}

          {summaryData && !!summaryData.messages.length && (
            <Box>
              {displayAlertBox('error', mdiAlertCircleOutline, summaryData.fileName, 'Validation Failed')}
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
          {summaryData && !summaryData.messages.length && (
            <Box>{displayAlertBox('info', mdiFileOutline, summaryData?.fileName, '')}</Box>
          )}
        </Box>
      </Paper>

      <ComponentDialog
        open={openImportSummaryResults}
        dialogTitle="Import Summary Results Data"
        onClose={() => {
          setOpenImportSummaryResults(false);
          summaryDataLoader.refresh();
        }}>
        <FileUpload
          dropZoneProps={{ maxNumFiles: 1, acceptedFileExtensions: '.csv, .xls, .txt, .xlsm, .xlsx' }}
          uploadHandler={importSummaryResults()}
        />
      </ComponentDialog>
    </>
  );
};

export default SurveySummaryResults;
