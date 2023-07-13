import { mdiImport } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ComponentDialog from 'components/dialog/ComponentDialog';
import FileUpload from 'components/file-upload/FileUpload';
import { IUploadHandler } from 'components/file-upload/FileUploadItem';
import { HasProjectOrSystemRole } from 'components/security/Guards';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { PublishStatus } from 'constants/attachments';
import { SYSTEM_ROLE } from 'constants/roles';
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
  const occurrenceSubmissionPublishStatus = surveyContext.observationDataLoader.data?.surveyObservationSupplementaryData
    ?.event_timestamp
    ? PublishStatus.SUBMITTED
    : PublishStatus.UNSUBMITTED;

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

      <H2ButtonToolbar
        label="Observations"
        buttonLabel="Import"
        buttonTitle="Import Observations"
        buttonProps={{ variant: 'contained', color: 'primary' }}
        buttonStartIcon={<Icon path={mdiImport} size={1} />}
        buttonOnClick={() => showUploadDialog()}
        renderButton={(buttonProps) => {
          const { disabled, ...rest } = buttonProps;

          // admins should always see this button
          // button should only be visible if the data has not been published
          if (
            HasProjectOrSystemRole({
              validProjectRoles: [],
              validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]
            }) ||
            occurrenceSubmissionPublishStatus !== PublishStatus.SUBMITTED
          ) {
            return <Button {...rest} />;
          }
        }}
      />

      <Divider />

      <Box p={3}>
        {/* Submission data is loading */}
        {!occurrenceSubmission && !surveyContext.observationDataLoader.isReady && <LoadingObservationsCard />}

        {/* Submission data has finished loading, but is null, no submission to display */}
        {!surveyContext.observationDataLoader.data && surveyContext.observationDataLoader.isReady && (
          <NoObservationsCard />
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
