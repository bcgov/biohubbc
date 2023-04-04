import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import { mdiImport } from '@mdi/js';
import Icon from '@mdi/react';
import ComponentDialog from 'components/dialog/ComponentDialog';
import FileUpload from 'components/file-upload/FileUpload';
import { IUploadHandler } from 'components/file-upload/FileUploadItem';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useInterval } from 'hooks/useInterval';
import { IUploadObservationSubmissionResponse } from 'interfaces/useObservationApi.interface';
import React, { useContext, useEffect, useState } from 'react';
import LoadingObservationsCard from './components/LoadingObservationsCard';
import NoObservationsCard from './components/NoObservationsCard';
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

  function handleOpenImportObservations() {
    setOpenImportObservations(true);
  }

  function handleCloseImportObservations() {
    setOpenImportObservations(false);
  }

  function showUploadDialog() {
    if (occurrenceSubmission) {
      // An observation submission already exists, warn user about overriding existing submission
      dialogContext.setYesNoDialog({
        dialogTitle: 'Import New Observation Data',
        dialogText:
          'Importing a new file will overwrite the existing observations data. Are you sure you want to proceed?',
        open: true,
        onYes: () => {
          handleOpenImportObservations();
          dialogContext.setYesNoDialog({ open: false });
        },
        onClose: () => dialogContext.setYesNoDialog({ open: false }),
        onNo: () => dialogContext.setYesNoDialog({ open: false })
      });
    } else {
      // Observation submission does not exist, prompt user to import an observation file
      handleOpenImportObservations();
    }
  }

  function handleDelete() {
    if (!occurrenceSubmission) {
      return;
    }

    dialogContext.setYesNoDialog({
      dialogTitle: 'Delete Observations?',
      dialogText: 'Are you sure you want to delete observation data from this survey? This action cannot be undone.',
      yesButtonProps: { color: 'secondary' },
      yesButtonLabel: 'Delete',
      noButtonProps: { color: 'default' },
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

      <Paper elevation={0}>
        <H2ButtonToolbar
          label="Observations"
          buttonLabel="Import"
          buttonTitle="Import Observations"
          buttonProps={{ variant: 'contained', color: 'primary' }}
          buttonStartIcon={<Icon path={mdiImport} size={1} />}
          buttonOnClick={() => showUploadDialog()}
        />

        <Divider />

        <Box p={3}>
          {/* Submission data is loading */}
          {!occurrenceSubmission && !surveyContext.observationDataLoader.isReady && <LoadingObservationsCard />}

          {/* Submission data has finished loading, but is null, no submission to display */}
          {!surveyContext.observationDataLoader.data && surveyContext.observationDataLoader.isReady && (
            <NoObservationsCard onImport={handleOpenImportObservations} />
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
      </Paper>
    </>
  );
};

export default SurveyObservations;
