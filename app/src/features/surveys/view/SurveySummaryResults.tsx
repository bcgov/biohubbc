import { Collapse, createStyles, LinearProgress, withStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import {
  mdiAlertCircleOutline,
  mdiDownload,
  mdiFileAlertOutline,
  mdiFileOutline,
  mdiImport,
  mdiInformationOutline,
  mdiTrashCanOutline
} from '@mdi/js';
import Icon from '@mdi/react';
import ComponentDialog from 'components/dialog/ComponentDialog';
import FileUpload from 'components/file-upload/FileUpload';
import { IUploadHandler } from 'components/file-upload/FileUploadItem';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { DialogContext } from 'contexts/dialogContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetSummaryResultsResponse } from 'interfaces/useSummaryResultsApi.interface';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';

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
        color: theme.palette.error.main
      }
    }
  },
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
  },
  summaryFileName: {
    marginTop: '2px',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textDecoration: 'underline',
    cursor: 'pointer'
  }
}));

export enum ClassGrouping {
  NOTICE = 'Notice',
  ERROR = 'Error',
  WARNING = 'Warning'
}

const SurveySummaryResults = () => {
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
  const biohubApi = useBiohubApi();
  const urlParams = useParams();

  const projectId = urlParams['id'];
  const surveyId = urlParams['survey_id'];
  const [openImportSummaryResults, setOpenImportSummaryResults] = useState(false);

  const [submission, setSubmission] = useState<IGetSummaryResultsResponse | null>(null);
  const [hasErrorMessages, setHasErrorMessages] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [filName, setFileName] = useState('');

  const classes = useStyles();

  const importSummaryResults = (): IUploadHandler => {
    return (file, cancelToken, handleFileUploadProgress) => {
      setFileName(file.name);
      return biohubApi.survey.uploadSurveySummaryResults(
        projectId,
        surveyId,
        file,
        cancelToken,
        handleFileUploadProgress
      );
    };
  };

  const dialogContext = useContext(DialogContext);

  const getSummarySubmission = useCallback(async () => {
    try {
      const submissionResponse = await biohubApi.survey.getSurveySummarySubmission(projectId, surveyId);

      if (submissionResponse?.messages.length) {
        setHasErrorMessages(true);
      } else {
        setHasErrorMessages(false);
      }

      setSubmission(() => {
        setIsLoading(false);

        return submissionResponse;
      });
    } catch (error) {
      return error;
    }
  }, [biohubApi.survey, surveyId, projectId]);

  useEffect(() => {
    if (isLoading) {
      getSummarySubmission();
    }
  }, [biohubApi, projectId, surveyId, isLoading, submission, getSummarySubmission]);

  const softDeleteSubmission = async () => {
    if (!submission?.id) {
      return;
    }

    await biohubApi.survey.deleteSummarySubmission(projectId, surveyId, submission?.id);

    await getSummarySubmission();
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

  const showUploadDialog = () => {
    if (submission) {
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

  //Action prop for the Alert MUI component to render the delete icon and associated action
  const submissionAlertAction = () => (
    <Box className={classes.alertActions}>
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

  const messageList = submission?.messages;

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
    if (!submission) {
      return;
    }

    let response;

    try {
      response = await biohubApi.survey.getSummarySubmissionSignedURL(projectId, surveyId, submission?.id);
    } catch {
      return;
    }

    if (!response) {
      return;
    }

    window.open(response);
  };

  type SeverityLevel = 'error' | 'info' | 'success' | 'warning';

  let submissionStatusIcon = isLoading ? mdiFileOutline : mdiFileOutline;
  let submissionStatusSeverity: SeverityLevel = 'info';

  if (messageList?.some((messageType) => messageType.type === 'Error')) {
    submissionStatusIcon = mdiFileAlertOutline;
    submissionStatusSeverity = 'error';
  } else if (messageList?.some((messageType) => messageType.type === 'Warning')) {
    submissionStatusIcon = mdiFileAlertOutline;
    submissionStatusSeverity = 'warning';
  } else if (messageList?.some((messageType) => messageType.type === 'Notice')) {
    submissionStatusIcon = mdiInformationOutline;
  }

  function displayAlertBox(severityLevel: SeverityLevel, iconName: string, fileName: string, message: string) {
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

        <Collapse in={isLoading} collapsedHeight="0">
          <Box mt={2}>
            <BorderLinearProgress />
          </Box>
        </Collapse>
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
          <Box style={{ display: 'none' }} mb={3}>
            <Alert severity="error" icon={<Icon path={mdiAlertCircleOutline} size={1} />}>
              <AlertTitle>Failed to import summary results</AlertTitle>
              One or more errors occurred while attempting to import your summary results.
              <Box mt={3}>
                <Box component="section">
                  <Typography variant="body2">
                    <strong>Section Title</strong>
                  </Typography>
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
                  <Typography variant="body2">
                    <strong>Section Title</strong>
                  </Typography>
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

          {/* No summary */}
          {!submission && !isLoading && (
            <Paper variant="outlined">
              <Box p={3} textAlign="center">
                <Typography data-testid="observations-nodata" variant="body2" color="textSecondary">
                  No Summary Results. &nbsp;
                  <Link onClick={() => setOpenImportSummaryResults(true)} className={classes.browseLink}>
                    Click Here to Import
                  </Link>
                </Typography>
              </Box>
            </Paper>
          )}

          {/* Data is still loading/ validating */}
          {isLoading && (
            <>
              <Paper variant="outlined" className={classes.importFile + ` ` + `${submissionStatusSeverity}`}>
                <Box className="importFile-icon" flex="0 0 auto" mt={1.2} mr={1.7}>
                  <Icon path={submissionStatusIcon} size={1} />
                </Box>

                <Box mr={2} flex="1 1 auto" style={{ overflow: 'hidden' }}>
                  <Typography
                    className={classes.summaryFileName}
                    variant="body2"
                    component="div"
                    onClick={viewFileContents}>
                    <strong>{filName}</strong>
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Processing file. Please wait...
                  </Typography>

                  <Collapse in={isLoading} collapsedHeight="0">
                    <Box mt={2}>
                      <BorderLinearProgress />
                    </Box>
                  </Collapse>
                </Box>
              </Paper>
            </>
          )}

          {/* Got a summary with errors */}
          {submission && hasErrorMessages && (
            <Box>
              {displayAlertBox('error', mdiAlertCircleOutline, submission.fileName, 'Validation Failed')}
              <Box>
                {displayMessages(submissionErrors, messageGrouping, mdiAlertCircleOutline)}
                {displayMessages(submissionWarnings, messageGrouping, mdiInformationOutline)}
              </Box>
            </Box>
          )}

          {/* All done */}
          {submission && !isLoading && !hasErrorMessages && (
            <>
              <Paper variant="outlined" className={classes.importFile + ` ` + `${submissionStatusSeverity}`}>
                <Box className="importFile-icon" flex="0 0 auto" mt={1.2} mr={1.7}>
                  <Icon path={submissionStatusIcon} size={1} />
                </Box>

                <Box mr={2} flex="1 1 auto" style={{ overflow: 'hidden' }}>
                  <Typography
                    className={classes.summaryFileName}
                    variant="body2"
                    component="div"
                    onClick={viewFileContents}>
                    <strong>{submission.fileName}</strong>
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Results Validated
                  </Typography>
                </Box>
              </Paper>
            </>
          )}
        </Box>
      </Paper>

      <ComponentDialog
        open={openImportSummaryResults}
        dialogTitle="Import Summary Results Data"
        onClose={() => {
          setOpenImportSummaryResults(false);
          setIsLoading(true);
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
