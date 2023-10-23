import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import ComponentDialog from 'components/dialog/ComponentDialog';
import FileUpload from 'components/file-upload/FileUpload';
import { IUploadHandler } from 'components/file-upload/FileUploadItem';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import NoSurveySectionData from 'features/surveys/components/NoSurveySectionData';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useInterval } from 'hooks/useInterval';
import { IUploadObservationSubmissionResponse } from 'interfaces/useObservationApi.interface';
import React, { useContext, useEffect, useState } from 'react';
import LoadingObservationsCard from './components/LoadingObservationsCard';
import ObservationFileCard from './components/ObservationFileCard';
import ObservationMessagesCard from './components/ObservationMessagesCard';
import ValidatingObservationsCard from './components/ValidatingObservationsCard';

const SurveyObservations: React.FC = () => {
  const biohubApi = useBiohubApi();
  const dialogContext = useContext(DialogContext);
  const surveyContext = useContext(SurveyContext);

  const [openImportObservations, setOpenImportObservations] = useState(false);

  const projectId = surveyContext.projectId as number;
  const surveyId = surveyContext.surveyId as number;

  useEffect(() => {
    surveyContext.observationDataLoader.load(projectId, surveyId);
  }, [surveyContext.observationDataLoader, projectId, surveyId]);

  const occurrenceSubmission = surveyContext.observationDataLoader.data?.surveyObservationData;
  const submissionPollingInterval = useInterval(
    () => surveyContext.observationDataLoader.refresh(projectId, surveyId),
    5000,
    60000
  );

  useEffect(() => {
    if (occurrenceSubmission) {
      submissionPollingInterval.enable();
    } else {
      submissionPollingInterval.disable();
    }
  }, [occurrenceSubmission, submissionPollingInterval]);

  useEffect(() => {
    if (occurrenceSubmission?.isValidating === false) {
      submissionPollingInterval.disable();
    }
  }, [occurrenceSubmission, submissionPollingInterval]);

  const importObservations = (): IUploadHandler => {
    return async (file, cancelToken, handleFileUploadProgress) => {
      return biohubApi.observation
        .uploadObservationSubmission(projectId, surveyId, file, cancelToken, handleFileUploadProgress)
        .then((result: IUploadObservationSubmissionResponse) => {
          if (file.type === 'application/x-zip-compressed' || file.type === 'application/zip') {
            // Process a DwCA zip file
            return biohubApi.observation.processDWCFile(projectId, result.submissionId);
          }

          // Process an Observation Template file
          return biohubApi.observation.processOccurrences(projectId, result.submissionId, surveyId);
        })
        .finally(() => {
          surveyContext.observationDataLoader.refresh(projectId, surveyId);
        });
    };
  };

  function handleCloseImportObservations() {
    setOpenImportObservations(false);
  }

  function handleDelete() {
    if (!occurrenceSubmission) {
      return;
    }

    dialogContext.setYesNoDialog({
      dialogTitle: 'Delete Observations?',
      dialogText: 'Are you sure you want to delete observation data from this survey? This action cannot be undone.',
      yesButtonProps: { color: 'error' },
      yesButtonLabel: 'Delete',
      noButtonProps: { color: 'primary' },
      noButtonLabel: 'Cancel',
      open: true,
      onYes: async () => {
        await biohubApi.observation.deleteObservationSubmission(
          projectId,
          surveyId,
          occurrenceSubmission.occurrence_submission_id
        );
        surveyContext.observationDataLoader.refresh(projectId, surveyId);
        dialogContext.setYesNoDialog({ open: false });
      },
      onClose: () => dialogContext.setYesNoDialog({ open: false }),
      onNo: () => dialogContext.setYesNoDialog({ open: false })
    });
  }

  const handleDownload = () => {
    if (!occurrenceSubmission) {
      return;
    }

    biohubApi.observation
      .getObservationSubmissionSignedURL(projectId, surveyId, occurrenceSubmission.occurrence_submission_id)
      .then((objectUrl: string) => {
        window.open(objectUrl);
      })
      .catch((_error: any) => {
        return;
      });
  };

  return (
    <>
      <ComponentDialog
        open={openImportObservations}
        dialogTitle="Import Observation Data"
        onClose={handleCloseImportObservations}>
        <FileUpload
          dropZoneProps={{ maxNumFiles: 1, acceptedFileExtensions: '.xls, .xlsm, .xlsx' }}
          uploadHandler={importObservations()}
        />
      </ComponentDialog>

      <Toolbar>
        <Typography variant="h2">Observations</Typography>
      </Toolbar>

      <Divider />

      <Box p={3}>
        {/* Submission data is loading */}
        {!occurrenceSubmission && !surveyContext.observationDataLoader.isReady && <LoadingObservationsCard />}

        {/* Submission data has finished loading, but is null, no submission to display */}
        {!surveyContext.observationDataLoader.data && surveyContext.observationDataLoader.isReady && (
          <NoSurveySectionData text={'Currently Unavailable'} paperVariant={'outlined'} />
        )}

        {/* Submission data exists, validation is running */}
        {surveyContext.observationDataLoader.data &&
          surveyContext.observationDataLoader.data.surveyObservationData.isValidating && (
            <ValidatingObservationsCard
              observationRecord={surveyContext.observationDataLoader.data}
              onDownload={handleDownload}
            />
          )}

        {/* Submission data exists, validation is not running */}
        {surveyContext.observationDataLoader.data &&
          !surveyContext.observationDataLoader.data.surveyObservationData.isValidating && (
            <ObservationMessagesCard observationRecord={surveyContext.observationDataLoader.data} />
          )}

        {/* Submission data exists, validation is not running */}
        {surveyContext.observationDataLoader.data &&
          !surveyContext.observationDataLoader.data.surveyObservationData.isValidating && (
            <ObservationFileCard
              observationRecord={surveyContext.observationDataLoader.data}
              onDownload={handleDownload}
              onDelete={handleDelete}
            />
          )}
      </Box>
    </>
  );
};

export default SurveyObservations;
