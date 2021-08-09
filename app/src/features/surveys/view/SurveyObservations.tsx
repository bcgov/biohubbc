import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import React, { useState } from 'react';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useParams } from 'react-router';
import { mdiUploadOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import ComponentDialog from 'components/dialog/ComponentDialog';
import FileUpload from 'components/attachments/FileUpload';

const SurveyObservations = () => {
  const biohubApi = useBiohubApi();
  const urlParams = useParams();

  const projectId = urlParams['id'];
  const surveyId = urlParams['survey_id'];

  const [openImportObservations, setOpenImportObservations] = useState(false);

  const importObservations = (): IUploadHandler => {
    return (files, cancelToken, handleFileUploadProgress) => {
      return biohubApi.survey.uploadObservationSubmission(
        projectId,
        surveyId,
        files[0],
        cancelToken,
        handleFileUploadProgress
      );
    };
  };

  return (
    <>
      <Box mb={5} display="flex" justifyContent="space-between">
        <Typography data-testid="observations-heading" variant="h2">
          Observations
        </Typography>

        <Button variant="outlined" onClick={() => setOpenImportObservations(true)}>
          <Icon path={mdiUploadOutline} size={1} />
          <Typography>Import</Typography>
        </Button>
      </Box>
      <ComponentDialog
        open={openImportObservations}
        dialogTitle="Import Observation Data"
        onClose={() => setOpenImportObservations(false)}>
        <FileUpload
          dropZoneProps={{ maxNumFiles: 1, acceptedFileExtensions: 'text/csv, .xls, .txt, .zip, .xlsm,  .xlsx, .txt' }}
          uploadHandler={importObservations()}
        />
      </ComponentDialog>
    </>
  );
};

export default SurveyObservations;
