import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import { mdiClockOutline, mdiFileOutline, mdiImport } from '@mdi/js';
import Icon from '@mdi/react';
import FileUpload from 'components/attachments/FileUpload';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { DialogContext } from 'contexts/dialogContext';
import ObservationSubmissionCSV from 'features/observations/components/ObservationSubmissionCSV';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';

const useStyles = makeStyles(() => ({
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
  }
}));

const SurveyObservations: React.FC = () => {
  const biohubApi = useBiohubApi();
  const urlParams = useParams();

  const projectId = urlParams['id'];
  const surveyId = urlParams['survey_id'];

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
  const [timer, setTimer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);

  const dialogContext = useContext(DialogContext);

  useEffect(() => {
    const fetchObservationSubmission = async () => {
      const submission = await biohubApi.observation.getObservationSubmission(projectId, surveyId);

      setSubmissionStatus(() => {
        setIsLoading(false);
        if (submission) {
          if (submission.status === 'Rejected' || submission.status === 'Darwin Core Validated') {
            setIsValidating(false);

            if (timer) {
              clearInterval(timer);
              setTimer(null);
            }
          } else {
            setIsValidating(true);
          }
        }

        return submission;
      });
    };

    if (isLoading) {
      fetchObservationSubmission();
    }

    if (isValidating && !timer) {
      const t = setInterval(fetchObservationSubmission, 5000);
      setTimer(t);
    }
  }, [biohubApi, isLoading, isValidating, submissionStatus, timer, projectId, surveyId]);

  const defaultYesNoDialogProps = {
    dialogTitle: 'Upload Observation Data',
    dialogText:
      'Are you sure you want to import a different data set?  This will overwrite the existing data you have already imported.',
    open: false,
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false }),
    onYes: () => dialogContext.setYesNoDialog({ open: false })
  };

  const showUploadDialog = () => {
    if (submissionStatus) {
      // already have observation data.  prompt user to confirm override
      dialogContext.setYesNoDialog({
        ...defaultYesNoDialogProps,
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

  if (isLoading) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
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
            <Alert severity="error">
              <AlertTitle>{submissionStatus.fileName}</AlertTitle>
              Validation Failed
            </Alert>

            <Box mb={3} mt={3} display="flex" justifyContent="space-between">
              <Typography data-testid="observations-error-details" variant="h4" className={classes.center}>
                What's next?
              </Typography>
            </Box>
            <Box mb={3} mt={3} display="flex" justifyContent="space-between">
              <Typography data-testid="observations-error-details" variant="body2" className={classes.center}>
                You will need to resolve the following errors in your local file and re-import:
              </Typography>
            </Box>
            <Box mb={5} display="flex" justifyContent="space-between">
              <ul>
                {submissionStatus?.messages.map((row: any) => (
                  <li>{row}</li>
                ))}
              </ul>
            </Box>
          </>
        )}
        {!isValidating && submissionStatus?.status === 'Darwin Core Validated' && (
          <>
            <Alert icon={<Icon path={mdiFileOutline} size={1} />} severity="info">
              <AlertTitle>{submissionStatus.fileName}</AlertTitle>
            </Alert>
            <Box mt={5}>
              <ObservationSubmissionCSV submissionId={submissionStatus.id} />
            </Box>
          </>
        )}
        {isValidating && (
          <>
            <Alert icon={<Icon path={mdiClockOutline} size={1} />} severity="info">
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
