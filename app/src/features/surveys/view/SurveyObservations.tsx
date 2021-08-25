import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
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

  const [submissionStatus, setSubmissionStatus] = useState<any>(null);
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

  const groupType = {
    mandatory: 'Mandatory fields have not been filled out in your file',
    unsupported_header: 'Column headers in your file are not supported',
    miscellaneous: 'Miscellaneous errors exist in your file'
  };

  const messageList = submissionStatus?.messages;

  const messageObject =
    (messageList &&
      messageList.reduce((workingData: any, row: any) => {
        let group;

        switch (row.error_code) {
          case 'missing_required_header':
          case 'missing_required_field':
            group = 'mandatory';
            break;
          case 'unknown_header':
            group = 'unsupported_header';
            break;
          default:
            group = 'miscellaneous';
        }

        if (!workingData[group]) {
          workingData[group] = [row.message];
        } else {
          workingData[group].push(row.message);
        }
        return workingData;
      }, {})) ||
    {};

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

            <Box mb={3} mt={3} display="flex" justifyContent="space-between">
              <Typography data-testid="observations-error-details" variant="h4" className={classes.center}>
                What's next?
              </Typography>
            </Box>
            <Box mb={3} mt={1} display="flex" justifyContent="space-between">
              <Typography data-testid="observations-error-details" variant="body2" className={classes.center}>
                Resolve the following errors in your local file and re-import.
              </Typography>
            </Box>
            <Box>
              <List component="div">
                {Object.keys(groupType).map((code: string, index: number) => {
                  if (messageObject[code]) {
                    return (
                      <div>
                        <ListItem>
                          <Icon path={mdiAlertCircleOutline} size={1} color="#ff5252" />{' '}
                          <strong className={classes.tab}>{groupType[code]}</strong>
                        </ListItem>
                        <Box pl={1}>
                          <ul key={index}>
                            {messageObject[code].map((message: string, index2: number) => (
                              <li key={index2}>{message}</li>
                            ))}
                          </ul>
                        </Box>
                      </div>
                    );
                  }
                })}
              </List>
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
              <AlertTitle>{submissionStatus.fileName}</AlertTitle>
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
