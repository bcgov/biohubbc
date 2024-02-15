import { mdiImport, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { LoadingButton } from '@mui/lab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { GridColDef } from '@mui/x-data-grid';
import DataGridValidationAlert from 'components/data-grid/DataGridValidationAlert';
import FileUploadDialog from 'components/dialog/FileUploadDialog';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { UploadFileStatus } from 'components/file-upload/FileUploadItem';
import { ObservationsTableI18N } from 'constants/i18n';
import { CodesContext } from 'contexts/codesContext';
import { DialogContext } from 'contexts/dialogContext';
import { IObservationTableRow } from 'contexts/observationsTableContext';
import { SurveyContext } from 'contexts/surveyContext';
import { BulkActionsButton } from 'features/surveys/observations/observations-table/bulk-actions/BulkActionsButton';
import { ConfigureColumnsContainer } from 'features/surveys/observations/observations-table/configure-table/ConfigureColumnsContainer';
import {
  ISampleMethodOption,
  ISamplePeriodOption,
  ISampleSiteOption,
  ObservationActionsColDef,
  ObservationCountColDef,
  ObservationDateColDef,
  ObservationLatitudeColDef,
  ObservationLongitudeColDef,
  ObservationTimeColDef,
  SampleMethodColDef,
  SamplePeriodColDef,
  SampleSiteColDef,
  TaxonomyColDef
} from 'features/surveys/observations/observations-table/GridColumnDefinitions';
import ObservationsTable from 'features/surveys/observations/observations-table/ObservationsTable';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useObservationTableContext } from 'hooks/useContext';
import {
  IGetSampleLocationRecord,
  IGetSampleMethodRecord,
  IGetSamplePeriodRecord
} from 'interfaces/useSurveyApi.interface';
import { useContext, useState } from 'react';
import { getCodesName } from 'utils/Utils';

const ObservationComponent = () => {
  const biohubApi = useBiohubApi();

  const codesContext = useContext(CodesContext);

  const surveyContext = useContext(SurveyContext);
  const { projectId, surveyId } = surveyContext;

  const observationsTableContext = useObservationTableContext();
  const { hasUnsavedChanges, validationModel, _muiDataGridApiRef } = observationsTableContext;

  const dialogContext = useContext(DialogContext);

  const [showImportDialog, setShowImportDialog] = useState<boolean>(false);
  const [processingRecords, setProcessingRecords] = useState<boolean>(false);
  const [showConfirmRemoveAllDialog, setShowConfirmRemoveAllDialog] = useState<boolean>(false);

  // Collect sample sites
  const surveySampleSites: IGetSampleLocationRecord[] = surveyContext.sampleSiteDataLoader.data?.sampleSites ?? [];
  const sampleSiteOptions: ISampleSiteOption[] =
    surveySampleSites.map((site) => ({
      survey_sample_site_id: site.survey_sample_site_id,
      sample_site_name: site.name
    })) ?? [];

  // Collect sample methods
  const surveySampleMethods: IGetSampleMethodRecord[] = surveySampleSites
    .filter((sampleSite) => Boolean(sampleSite.sample_methods))
    .map((sampleSite) => sampleSite.sample_methods as IGetSampleMethodRecord[])
    .flat(2);
  const sampleMethodOptions: ISampleMethodOption[] = surveySampleMethods.map((method) => ({
    survey_sample_method_id: method.survey_sample_method_id,
    survey_sample_site_id: method.survey_sample_site_id,
    sample_method_name: getCodesName(codesContext.codesDataLoader.data, 'sample_methods', method.method_lookup_id) ?? ''
  }));

  // Collect sample periods
  const samplePeriodOptions: ISamplePeriodOption[] = surveySampleMethods
    .filter((sampleMethod) => Boolean(sampleMethod.sample_periods))
    .map((sampleMethod) => sampleMethod.sample_periods as IGetSamplePeriodRecord[])
    .flat(2)
    .map((samplePeriod: IGetSamplePeriodRecord) => ({
      survey_sample_period_id: samplePeriod.survey_sample_period_id,
      survey_sample_method_id: samplePeriod.survey_sample_method_id,
      sample_period_name: `${samplePeriod.start_date} ${samplePeriod.start_time || ''} - ${samplePeriod.end_date} ${
        samplePeriod.end_time || ''
      }`
    }));

  /**
   * Callback fired when the user attempts to import observations.
   *
   * @param {File} file
   * @return {*}
   */
  const handleImportObservations = async (file: File) => {
    return biohubApi.observation.uploadCsvForImport(projectId, surveyId, file).then((response) => {
      setShowImportDialog(false);
      setProcessingRecords(true);
      biohubApi.observation
        .processCsvSubmission(projectId, surveyId, response.submissionId)
        .then(() => {
          dialogContext.setSnackbar({
            snackbarMessage: (
              <Typography variant="body2" component="div">
                {ObservationsTableI18N.importRecordsSuccessSnackbarMessage}
              </Typography>
            ),
            open: true
          });
          return observationsTableContext.refreshObservationRecords();
        })
        .catch((apiError) => {
          dialogContext.setErrorDialog({
            dialogTitle: ObservationsTableI18N.importRecordsErrorDialogTitle,
            dialogText: ObservationsTableI18N.importRecordsErrorDialogText,
            dialogErrorDetails: [apiError.message],
            open: true,
            onClose: () => {
              dialogContext.setErrorDialog({ open: false });
            },
            onOk: () => {
              dialogContext.setErrorDialog({ open: false });
            }
          });
        })
        .finally(() => {
          setProcessingRecords(false);
        });
    });
  };

  // The column definitions of the columns to render in the observations table
  const columns: GridColDef<IObservationTableRow>[] = [
    TaxonomyColDef({ hasError: observationsTableContext.hasError }),
    SampleSiteColDef({ sampleSiteOptions, hasError: observationsTableContext.hasError }),
    SampleMethodColDef({ sampleMethodOptions, hasError: observationsTableContext.hasError }),
    SamplePeriodColDef({ samplePeriodOptions, hasError: observationsTableContext.hasError }),
    ObservationCountColDef({ hasError: observationsTableContext.hasError }),
    ObservationDateColDef({ hasError: observationsTableContext.hasError }),
    ObservationTimeColDef({ hasError: observationsTableContext.hasError }),
    ObservationLatitudeColDef({ hasError: observationsTableContext.hasError }),
    ObservationLongitudeColDef({ hasError: observationsTableContext.hasError }),
    ...observationsTableContext.measurementColumns.map((item) => item.colDef),
    ObservationActionsColDef({
      disabled: observationsTableContext.isSaving,
      onDelete: observationsTableContext.deleteObservationRecords
    })
  ];

  return (
    <>
      <FileUploadDialog
        open={showImportDialog}
        dialogTitle="Import Observation CSV"
        onClose={() => setShowImportDialog(false)}
        onUpload={handleImportObservations}
        FileUploadProps={{
          dropZoneProps: { maxNumFiles: 1, acceptedFileExtensions: '.csv' },
          status: UploadFileStatus.STAGED
        }}></FileUploadDialog>
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
          observationsTableContext.revertObservationRecords();
        }}
        onClose={() => setShowConfirmRemoveAllDialog(false)}
        onNo={() => setShowConfirmRemoveAllDialog(false)}
      />
      <Paper component={Stack} flexDirection="column" flex="1 1 auto" height="100%">
        <Toolbar
          disableGutters
          sx={{
            pl: 2,
            pr: 3
          }}>
          <Typography
            sx={{
              flexGrow: '1',
              fontSize: '1.125rem',
              fontWeight: 700
            }}>
            Observations &zwnj;
            <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
              ({observationsTableContext.observationCount})
            </Typography>
          </Typography>

          <Stack flexDirection="row" alignItems="center" gap={1} whiteSpace="nowrap">
            <Button
              variant="contained"
              color="primary"
              startIcon={<Icon path={mdiImport} size={1} />}
              onClick={() => setShowImportDialog(true)}>
              Import
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Icon path={mdiPlus} size={1} />}
              onClick={() => observationsTableContext.addObservationRecord()}
              disabled={observationsTableContext.isSaving}>
              Add Record
            </Button>
            <Collapse in={hasUnsavedChanges} orientation="horizontal" sx={{ mr: -1 }}>
              <Box whiteSpace="nowrap" display="flex" sx={{ gap: 1, pr: 1 }}>
                <LoadingButton
                  loading={observationsTableContext.isSaving}
                  variant="contained"
                  color="primary"
                  onClick={() => observationsTableContext.saveObservationRecords()}
                  disabled={observationsTableContext.isSaving}>
                  Save
                </LoadingButton>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setShowConfirmRemoveAllDialog(true)}
                  disabled={observationsTableContext.isSaving}>
                  Discard Changes
                </Button>
              </Box>
            </Collapse>
            <ConfigureColumnsContainer disabled={observationsTableContext.isSaving} columns={columns} />
            <BulkActionsButton disabled={observationsTableContext.isSaving} />
          </Stack>
        </Toolbar>

        <Divider flexItem></Divider>

        <DataGridValidationAlert validationModel={validationModel} muiDataGridApiRef={_muiDataGridApiRef.current} />

        <Box display="flex" flexDirection="column" flex="1 1 auto" position="relative">
          <Box position="absolute" width="100%" height="100%">
            <ObservationsTable
              isLoading={processingRecords}
              rowModesModel={observationsTableContext.rowModesModel}
              columns={columns}
            />
          </Box>
        </Box>
      </Paper>
    </>
  );
};

export default ObservationComponent;
