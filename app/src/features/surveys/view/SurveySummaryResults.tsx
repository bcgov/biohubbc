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
import { mdiFileOutline, mdiImport, mdiTrashCanOutline, mdiDownload } from '@mdi/js';
import Icon from '@mdi/react';
import FileUpload from 'components/attachments/FileUpload';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { DialogContext } from 'contexts/dialogContext';
import ObservationSubmissionCSV from 'features/observations/components/ObservationSubmissionCSV';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetSummaryResultsResponse } from 'interfaces/useSummaryResultsApi.interface';
import React, { useContext, useEffect, useState } from 'react';
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

const SurveySummaryResults = () => {
  const biohubApi = useBiohubApi();
  const urlParams = useParams();

  const projectId = urlParams['id'];
  const surveyId = urlParams['survey_id'];
  const [openImportSummaryResults, setOpenImportSummaryResults] = useState(false);

  const [submission, setSubmission] = useState<IGetSummaryResultsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const classes = useStyles();

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

  const dialogContext = useContext(DialogContext);

  const getSummarySubmission = async () => {
    const submissionResponse = await biohubApi.survey.getSurveySummarySubmission(projectId, surveyId);

    setSubmission(() => {
      setIsLoading(false);
      return submissionResponse;
    });
  };

  useEffect(() => {
    if (isLoading) {
      getSummarySubmission();
    }
  }, [biohubApi, projectId, surveyId, isLoading]);

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
      <IconButton aria-label="open" color="inherit" size="small" onClick={() => viewFileContents()}>
        <Icon path={mdiDownload} size={1} />
      </IconButton>
      <IconButton aria-label="delete" color="inherit" size="small" onClick={() => showDeleteDialog()}>
        <Icon path={mdiTrashCanOutline} size={1} />
      </IconButton>
    </Box>
  );

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

  if (isLoading) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  type severityLevel = 'error' | 'info' | 'success' | 'warning' | undefined;

  function displayAlertBox(severityLevel: severityLevel, iconName: string, fileName: string, message: string) {
    return (
      <Alert icon={<Icon path={iconName} size={1} />} severity={severityLevel} action={submissionAlertAction()}>
        <Box component={AlertTitle} display="flex">
          <Link underline="always" component="button" variant="body2" onClick={() => viewFileContents()}>
            <strong>{fileName}</strong>
          </Link>
        </Box>
        {message}
      </Alert>
    );
  }

  return (
    <Box>
      <Box mb={5} display="flex" justifyContent="space-between">
        <Typography data-testid="summary-results-heading" variant="h2">
          Summary Results
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
        {!submission && (
          <Typography data-testid="observations-nodata" variant="body2" className={`${classes.infoBox} ${classes.box}`}>
            No Summary Results. &nbsp;
            <Link onClick={() => setOpenImportSummaryResults(true)} className={classes.browseLink}>
              Click Here to Import
            </Link>
          </Typography>
        )}
        {submission && (
          <>
            {displayAlertBox('info', mdiFileOutline, submission?.fileName, '')}

            <Box mt={5} overflow="hidden">
              <ObservationSubmissionCSV
                getCSVData={() => {
                  return biohubApi.survey.getSubmissionCSVForView(projectId, surveyId, submission.id);
                }}
              />
            </Box>
          </>
        )}
      </Box>

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
    </Box>
  );
};

export default SurveySummaryResults;
