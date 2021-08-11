import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React, { useState, useEffect } from 'react';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useParams } from 'react-router';
import { mdiImport } from '@mdi/js';
import Icon from '@mdi/react';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import ComponentDialog from 'components/dialog/ComponentDialog';
import FileUpload from 'components/attachments/FileUpload';
import ObservationSubmissionCSV from 'features/observations/components/ObservationSubmissionCSV';

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

  const [myStatus, setMyStatus] = useState<string | null>(null);
  const [myTimer, setMyTimer] = useState<any>(null);

  useEffect(() => {
    if (!myTimer) {
      const timer = setInterval(() => {
        async function fetchObservationSubmission() {
          try {
            const os = await biohubApi.survey.getObservationSubmission(projectId, surveyId);

            const status = os?.status;
            setMyStatus(status);

            if (!status || status === 'Published' || status === 'Rejected') {
              clearInterval(timer);
            }
            console.log('os.status = ', os?.status);
            console.log('This will run every five seconds - ', timer, status);
          } catch (e) {
            console.error('Failed to call the API - ', e);
          }
        }
        fetchObservationSubmission();
      }, 100);
      setMyTimer(timer);
    }
  }, [myTimer]);

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
      {!myStatus && (
        <Box mb={5} display="flex" justifyContent="space-between">
          <Typography data-testid="observations-summary" variant="body2" className={classes.infoBox}>
            No Observation Data.{' '}
            <Link onClick={() => setOpenImportObservations(true)} className={classes.browseLink}>
              Click Here to Import
            </Link>
          </Typography>
        </Box>
      )}
      {myStatus === 'Rejected' && (
        <Box mb={5} display="flex" justifyContent="space-between">
          <div className={classes.errorBox}>
            <Typography data-testid="observations-summary" variant="body2" className={classes.center}>
              Error occurred.
            </Typography>
          </div>
        </Box>
      )}
      {myStatus === 'Published' && (
        <div>
          <Box mb={5} display="flex" justifyContent="space-between">
            <div className={classes.successBox}>
              <Typography data-testid="observations-summary" variant="body2" className={classes.center}>
                Success.
              </Typography>
            </div>
          </Box>
          <ObservationSubmissionCSV submissionId={1} />
        </div>
      )}
      <ComponentDialog
        open={openImportObservations}
        dialogTitle="Import Observation Data"
        onClose={() => setOpenImportObservations(false)}>
        <FileUpload
          dropZoneProps={{ maxNumFiles: 1, acceptedFileExtensions: '.csv, .xls, .txt, .zip, .xlsm, .xlsx' }}
          uploadHandler={importObservations()}
        />
      </ComponentDialog>
    </>
  );
};

export default SurveyObservations;
