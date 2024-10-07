import { mdiPlus } from '@mdi/js';
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
import { GridColDef, GridRenderEditCellParams } from '@mui/x-data-grid';
import DataGridValidationAlert from 'components/data-grid/DataGridValidationAlert';
import {
  GenericCommentColDef,
  GenericDateColDef,
  GenericLatitudeColDef,
  GenericLongitudeColDef,
  GenericTimeColDef
} from 'components/data-grid/GenericGridColumnDefinitions';
import { IObservationTableRow } from 'contexts/observationsTableContext';
import { BulkActionsButton } from 'features/surveys/observations/observations-table/bulk-actions/BulkActionsButton';
import { DiscardChangesButton } from 'features/surveys/observations/observations-table/discard-changes/DiscardChangesButton';
import {
  ISampleMethodOption,
  ISamplePeriodOption,
  ISampleSiteOption,
  ObservationCountColDef,
  ObservationSubcountSignColDef,
  SampleMethodColDef,
  SamplePeriodColDef,
  SampleSiteColDef,
  TaxonomyColDef
} from 'features/surveys/observations/observations-table/grid-column-definitions/GridColumnDefinitions';
import { ImportObservationsButton } from 'features/surveys/observations/observations-table/import-obsevations/ImportObservationsButton';
import ObservationsTable from 'features/surveys/observations/observations-table/ObservationsTable';
import {
  useCodesContext,
  useObservationsPageContext,
  useObservationsTableContext,
  useSurveyContext
} from 'hooks/useContext';
import {
  IGetSampleLocationDetails,
  IGetSampleMethodDetails,
  IGetSamplePeriodRecord
} from 'interfaces/useSamplingSiteApi.interface';
import { useEffect, useMemo } from 'react';
import { getCodesName } from 'utils/Utils';
import { ConfigureColumnsButton } from './configure-columns/ConfigureColumnsButton';
import ExportHeadersButton from './export-button/ExportHeadersButton';
import { ObservationSubcountCommentDialog } from './grid-column-definitions/comment/ObservationSubcountCommentDialog';
import {
  getEnvironmentColumnDefinitions,
  getMeasurementColumnDefinitions
} from './grid-column-definitions/GridColumnDefinitionsUtils';

const ObservationsTableContainer = () => {
  const codesContext = useCodesContext();
  const surveyContext = useSurveyContext();
  const observationsPageContext = useObservationsPageContext();
  const observationsTableContext = useObservationsTableContext();

  useEffect(() => {
    codesContext.codesDataLoader.load();
    surveyContext.sampleSiteDataLoader.load(surveyContext.projectId, surveyContext.surveyId);
  }, [
    codesContext.codesDataLoader,
    surveyContext.projectId,
    surveyContext.sampleSiteDataLoader,
    surveyContext.surveyId
  ]);

  // Collect sample sites
  const surveySampleSites: IGetSampleLocationDetails[] = useMemo(
    () => surveyContext.sampleSiteDataLoader.data?.sampleSites ?? [],
    [surveyContext.sampleSiteDataLoader.data?.sampleSites]
  );

  const sampleSiteOptions: ISampleSiteOption[] = useMemo(
    () =>
      surveySampleSites.map((site) => ({
        survey_sample_site_id: site.survey_sample_site_id,
        sample_site_name: site.name
      })) ?? [],
    [surveySampleSites]
  );

  // Collect sample methods
  const surveySampleMethods: IGetSampleMethodDetails[] = surveySampleSites
    .filter((sampleSite) => Boolean(sampleSite.sample_methods))
    .map((sampleSite) => sampleSite.sample_methods as IGetSampleMethodDetails[])
    .flat(2);
  const sampleMethodOptions: ISampleMethodOption[] = surveySampleMethods.map((method) => ({
    survey_sample_method_id: method.survey_sample_method_id,
    survey_sample_site_id: method.survey_sample_site_id,
    sample_method_name: method.technique.name,
    response_metric:
      getCodesName(codesContext.codesDataLoader.data, 'method_response_metrics', method.method_response_metric_id) ?? ''
  }));

  // Collect sample periods
  const samplePeriodOptions: ISamplePeriodOption[] = surveySampleMethods
    .filter((sampleMethod) => Boolean(sampleMethod.sample_periods))
    .map((sampleMethod) => sampleMethod.sample_periods as IGetSamplePeriodRecord[])
    .flat(2)
    .map((samplePeriod: IGetSamplePeriodRecord) => ({
      survey_sample_period_id: samplePeriod.survey_sample_period_id,
      survey_sample_method_id: samplePeriod.survey_sample_method_id,
      sample_period_name: `${samplePeriod.start_date} ${samplePeriod.start_time ?? ''} - ${samplePeriod.end_date} ${
        samplePeriod.end_time ?? ''
      }`
    }));

  const observationSubcountSignOptions = useMemo(
    () =>
      codesContext.codesDataLoader.data?.observation_subcount_signs.map((option) => ({
        observation_subcount_sign_id: option.id,
        name: option.name
      })) ?? [],
    [codesContext.codesDataLoader.data?.observation_subcount_signs]
  );

  // The column definitions of the columns to render in the observations table
  const columns: GridColDef<IObservationTableRow>[] = useMemo(
    () => [
      // Add standard observation columns to the table
      TaxonomyColDef({ hasError: observationsTableContext.hasError }),
      SampleSiteColDef({ sampleSiteOptions, hasError: observationsTableContext.hasError }),
      SampleMethodColDef({ sampleMethodOptions, hasError: observationsTableContext.hasError }),
      SamplePeriodColDef({ samplePeriodOptions, hasError: observationsTableContext.hasError }),
      ObservationSubcountSignColDef({ observationSubcountSignOptions, hasError: observationsTableContext.hasError }),
      ObservationCountColDef({ sampleMethodOptions, hasError: observationsTableContext.hasError }),
      GenericDateColDef({ field: 'observation_date', headerName: 'Date', hasError: observationsTableContext.hasError }),
      GenericTimeColDef({ field: 'observation_time', headerName: 'Time', hasError: observationsTableContext.hasError }),
      GenericLatitudeColDef({ field: 'latitude', headerName: 'Lat', hasError: observationsTableContext.hasError }),
      GenericLongitudeColDef({ field: 'longitude', headerName: 'Long', hasError: observationsTableContext.hasError }),
      // Add measurement columns to the table
      ...getMeasurementColumnDefinitions(
        observationsTableContext.measurementColumns,
        observationsTableContext.hasError
      ),
      // Add environment columns to the table
      ...getEnvironmentColumnDefinitions(
        observationsTableContext.environmentColumns,
        observationsTableContext.hasError
      ),
      GenericCommentColDef({
        field: 'comment',
        headerName: '',
        hasError: observationsTableContext.hasError,
        handleOpen: (params: GridRenderEditCellParams) => observationsTableContext.setCommentDialogParams(params),
        handleClose: () => observationsTableContext.setCommentDialogParams(null)
      })
    ],
    // observationsTableContext is listed as a missing dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      observationSubcountSignOptions,
      observationsTableContext.environmentColumns,
      observationsTableContext.hasError,
      observationsTableContext.measurementColumns,
      observationsTableContext.setCommentDialogParams,
      sampleMethodOptions,
      samplePeriodOptions,
      sampleSiteOptions
    ]
  );

  return (
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
          <ImportObservationsButton
            disabled={observationsTableContext.isSaving || observationsTableContext.isDisabled}
            onStart={() => observationsPageContext.setIsDisabled(true)}
            onSuccess={() => observationsTableContext.refreshObservationRecords()}
            onFinish={() => observationsPageContext.setIsDisabled(false)}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<Icon path={mdiPlus} size={1} />}
            onClick={() => observationsTableContext.addObservationRecord()}
            disabled={observationsTableContext.isSaving || observationsTableContext.isDisabled}>
            Add Record
          </Button>
          <Collapse in={observationsTableContext.hasUnsavedChanges} orientation="horizontal" sx={{ mr: -1 }}>
            <Box whiteSpace="nowrap" display="flex" sx={{ gap: 1, pr: 1 }}>
              <LoadingButton
                loading={observationsTableContext.isSaving || observationsTableContext.isDisabled}
                variant="contained"
                color="primary"
                onClick={() => observationsTableContext.saveObservationRecords()}
                disabled={observationsTableContext.isSaving || observationsTableContext.isDisabled}>
                Save
              </LoadingButton>
              <DiscardChangesButton
                disabled={observationsTableContext.isSaving || observationsTableContext.isDisabled}
                onDiscard={() => observationsTableContext.discardChanges()}
              />
            </Box>
          </Collapse>
          <ConfigureColumnsButton
            disabled={observationsTableContext.isSaving || observationsTableContext.isDisabled}
            columns={columns}
          />
          <ExportHeadersButton />
          <BulkActionsButton disabled={observationsTableContext.isSaving || observationsTableContext.isDisabled} />
        </Stack>
      </Toolbar>

      <Divider flexItem></Divider>

      <DataGridValidationAlert
        validationModel={observationsTableContext.validationModel}
        muiDataGridApiRef={observationsTableContext._muiDataGridApiRef.current}
      />

      <ObservationSubcountCommentDialog
        // The key prop is necessary for the dialog to correctly reset if the user discards changes
        key={observationsTableContext.commentDialogParams?.id ?? 'comment-dialog-key'}
        open={Boolean(observationsTableContext.commentDialogParams)}
        initialValue={observationsTableContext.commentDialogParams?.value}
        handleClose={() => observationsTableContext.setCommentDialogParams(null)}
        handleSave={(value) => {
          if (!observationsTableContext.commentDialogParams) {
            return;
          }

          observationsTableContext.commentDialogParams.api.setEditCellValue({
            value,
            id: observationsTableContext.commentDialogParams.id,
            field: observationsTableContext.commentDialogParams.field
          });
        }}
      />

      <Box display="flex" flexDirection="column" flex="1 1 auto" position="relative">
        <Box position="absolute" width="100%" height="100%">
          <ObservationsTable
            isLoading={
              observationsTableContext.isLoading ||
              observationsTableContext.isSaving ||
              observationsTableContext.isDisabled ||
              codesContext.codesDataLoader.isLoading
            }
            columns={columns}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default ObservationsTableContainer;
