import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Link from '@material-ui/core/Link';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { mdiImport } from '@mdi/js';
import Icon from '@mdi/react';
import FileUpload from 'components/attachments/FileUpload';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import ComponentDialog from 'components/dialog/ComponentDialog';
import ObservationSubmissionCSV from 'features/observations/components/ObservationSubmissionCSV';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React, { useEffect, useState } from 'react';
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
  infoBox: {
    width: '100%',
    background: 'rgba(241, 243, 245, 1)',
    alignSelf: 'center',
    minHeight: '3rem'
  },
  errorBox: {
    width: '100%',
    background: 'rgba(244, 67, 54, 0.1)',
    alignSelf: 'center',
    minHeight: '3rem'
  },
  successBox: {
    width: '100%',
    background: 'rgba(33, 150, 243, 0.1)',
    alignSelf: 'center',
    minHeight: '3rem'
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

  useEffect(() => {
    const fetchObservationSubmission = async () => {
      try {
        const submission = await biohubApi.survey.getObservationSubmission(projectId, surveyId);

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
      } catch (e) {
        console.error('Failed to call the API - ', e);
      }
    };

    if (isLoading) {
      fetchObservationSubmission();
    }

    if (isValidating && !timer) {
      const t = setInterval(fetchObservationSubmission, 5000);
      setTimer(t);
    }
  }, [biohubApi, isLoading, isValidating, submissionStatus, timer, projectId, surveyId]);

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
          onClick={() => setOpenImportObservations(true)}>
          Import
        </Button>
      </Box>
      {!isLoading && !submissionStatus && (
        <Box mb={5} display="flex" justifyContent="space-between">
          <Typography data-testid="observations-nodata" variant="body2" className={classes.infoBox}>
            No Observation Data.{' '}
            <Link onClick={() => setOpenImportObservations(true)} className={classes.browseLink}>
              Click Here to Import
            </Link>
          </Typography>
        </Box>
      )}
      {!isLoading && !isValidating && submissionStatus?.status === 'Rejected' && (
        <div>
          <Box mb={5} display="flex" justifyContent="space-between">
            <div className={classes.errorBox}>
              <Typography data-testid="observations-error-summary" variant="body2" className={classes.center}>
                Error occurred.
              </Typography>
            </div>
          </Box>
          <Box mb={5} display="flex" justifyContent="space-between">
            <Typography data-testid="observations-error-details" variant="body2" className={classes.center}>
              {submissionStatus?.message}
            </Typography>
          </Box>
        </div>
      )}
      {!isLoading && !isValidating && submissionStatus?.status === 'Darwin Core Validated' && (
        <div>
          <Box mb={5} display="flex" justifyContent="space-between">
            <div className={classes.successBox}>
              <Typography data-testid="observations-success-summary" variant="body2" className={classes.center}>
                Success.
              </Typography>
            </div>
          </Box>
          <ObservationSubmissionCSV submissionId={submissionStatus.id} />
        </div>
      )}
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
