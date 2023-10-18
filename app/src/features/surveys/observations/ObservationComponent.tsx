import { mdiImport, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { LoadingButton } from '@mui/lab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { ObservationsTableI18N } from 'constants/i18n';
import { CodesContext } from 'contexts/codesContext';
import { ObservationsContext } from 'contexts/observationsContext';
import { SurveyContext } from 'contexts/surveyContext';
import ObservationsTable, {
  ISampleMethodSelectProps,
  ISamplePeriodSelectProps,
  ISampleSiteSelectProps
} from 'features/surveys/observations/ObservationsTable';
import { useContext, useState } from 'react';
import { getCodesName } from 'utils/Utils';
import ComponentDialog from 'components/dialog/ComponentDialog';
import FileUpload from 'components/file-upload/FileUpload';
import { IUploadHandler } from 'components/file-upload/FileUploadItem';

const ObservationComponent = () => {
  const sampleSites: ISampleSiteSelectProps[] = [];
  const sampleMethods: ISampleMethodSelectProps[] = [];
  const samplePeriods: ISamplePeriodSelectProps[] = [];
  const observationsContext = useContext(ObservationsContext);
  const surveyContext = useContext(SurveyContext);
  const codesContext = useContext(CodesContext);

  const [showImportDiaolog, setShowImportDiaolog] = useState<boolean>(false);

  const handleImportObservations = (): IUploadHandler => {
    return async (file, cancelToken, handleFileUploadProgress) => {
      /*
      return biohubApi.observation
        .uploadObservationSubmission(projectId, surveyId, file, cancelToken, handleFileUploadProgress)
        .then((result: IUploadObservationSubmissionResponse) => {
          if (file.type === 'application/x-zip-compressed' || file.type === 'application/zip') {
            // Process a DwCA zip file
            return biohubApi.dwca.processDWCFile(projectId, result.submissionId);
          }

          // Process an Observation Template file
          return biohubApi.dwca.processOccurrences(projectId, result.submissionId, surveyId);
        })
        .finally(() => {
          surveyContext.observationDataLoader.refresh(projectId, surveyId);
        });
      */
    };
  };

  const hasUnsavedChanges = observationsContext.hasUnsavedChanges();
  const [showConfirmRemoveAllDialog, setShowConfirmRemoveAllDialog] = useState<boolean>(false);

  if (surveyContext.sampleSiteDataLoader.data && codesContext.codesDataLoader.data) {
    // loop through and collect all sites
    surveyContext.sampleSiteDataLoader.data.sampleSites.forEach((site) => {
      sampleSites.push({
        survey_sample_site_id: site.survey_sample_site_id,
        sample_site_name: site.name
      });

      // loop through and collect all methods for all sites
      site.sample_methods?.forEach((method) => {
        sampleMethods.push({
          survey_sample_method_id: method.survey_sample_method_id,
          survey_sample_site_id: site.survey_sample_site_id,
          sample_method_name:
            getCodesName(codesContext.codesDataLoader.data, 'sample_methods', method.method_lookup_id) ?? ''
        });

        // loop through and collect all periods for all methods for all sites
        method.sample_periods?.forEach((period) => {
          samplePeriods.push({
            survey_sample_period_id: period.survey_sample_period_id,
            survey_sample_method_id: period.survey_sample_method_id,
            sample_period_name: `${period.start_date} - ${period.end_date}`
          });
        });
      });
    });
  }

  return (
    <>
      <ComponentDialog
        open={showImportDiaolog}
        dialogTitle="Import Observation CSV"
        onClose={() => setShowImportDiaolog(false)}>
        <FileUpload
          dropZoneProps={{ maxNumFiles: 1, acceptedFileExtensions: '.csv' }}
          uploadHandler={handleImportObservations()}
        />
      </ComponentDialog>
      <YesNoDialog
        dialogTitle={ObservationsTableI18N.removeAllDialogTitle}
        dialogText={ObservationsTableI18N.removeAllDialogText}
        yesButtonProps={{ color: 'error' }}
        yesButtonLabel={'Discard Changes'}
        noButtonProps={{ color: 'primary', variant: 'outlined' }}
        noButtonLabel={'Cancel'}
        open={showConfirmRemoveAllDialog}
        onYes={() => {
          setShowConfirmRemoveAllDialog(false);
          observationsContext.revertRecords();
        }}
        onClose={() => setShowConfirmRemoveAllDialog(false)}
        onNo={() => setShowConfirmRemoveAllDialog(false)}
      />
      <Box
        display="flex"
        flexDirection="column"
        flex="1 1 auto"
        height="100%"
        sx={{
          overflow: 'hidden'
        }}>
        <Toolbar
          sx={{
            flex: '0 0 auto',
            borderBottom: '1px solid #ccc',
            '& button': {
              minWidth: '6rem'
            },
            '& button + button': {
              ml: 1
            }
          }}>
          <Typography
            sx={{
              flexGrow: '1',
              fontSize: '1.125rem',
              fontWeight: 700
            }}>
            Observations
          </Typography>

          <Box
            sx={{
              '& div:first-of-type': {
                display: 'flex',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }
            }}>
            <Box display="flex" overflow="hidden">
              <Button
                variant="contained"
                color="primary"
                startIcon={<Icon path={mdiImport} size={1} />}
                onClick={() => setShowImportDiaolog(true)}>
                Import
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Icon path={mdiPlus} size={1} />}
                onClick={() => observationsContext.createNewRecord()}
                disabled={observationsContext.isSaving}>
                Add Record
              </Button>
              <Collapse in={hasUnsavedChanges} orientation="horizontal">
                <Box ml={1} whiteSpace="nowrap">
                  <LoadingButton
                    loading={observationsContext.isSaving}
                    variant="contained"
                    color="primary"
                    onClick={() => observationsContext.stopEditAndSaveRows()}
                    disabled={observationsContext.isSaving}>
                    Save
                  </LoadingButton>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => setShowConfirmRemoveAllDialog(true)}
                    disabled={observationsContext.isSaving}>
                    Discard Changes
                  </Button>
                </Box>
              </Collapse>
            </Box>
          </Box>
        </Toolbar>
        <Box display="flex" flexDirection="column" flex="1 1 auto" position="relative">
          <Box position="absolute" width="100%" height="100%" py={1} px={1} pt={0.5}>
            <ObservationsTable
              sample_sites={sampleSites}
              sample_methods={sampleMethods}
              sample_periods={samplePeriods}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ObservationComponent;
