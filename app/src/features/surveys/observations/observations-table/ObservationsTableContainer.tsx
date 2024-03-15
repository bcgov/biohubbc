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
import { GridColDef } from '@mui/x-data-grid';
import DataGridValidationAlert from 'components/data-grid/DataGridValidationAlert';
import { CodesContext } from 'contexts/codesContext';
import { IObservationTableRow } from 'contexts/observationsTableContext';
import { SurveyContext } from 'contexts/surveyContext';
import { BulkActionsButton } from 'features/surveys/observations/observations-table/bulk-actions/BulkActionsButton';
import { ConfigureColumnsContainer } from 'features/surveys/observations/observations-table/configure-table/ConfigureColumnsContainer';
import { DiscardChangesButton } from 'features/surveys/observations/observations-table/discard-changes/DiscardChangesButton';
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
} from 'features/surveys/observations/observations-table/grid-column-definitions/GridColumnDefinitions';
import { ImportObservationsButton } from 'features/surveys/observations/observations-table/import-observations/ImportObservationsButton';
import ObservationsTable from 'features/surveys/observations/observations-table/ObservationsTable';
import { useObservationsTableContext } from 'hooks/useContext';
import {
  IGetSampleLocationDetails,
  IGetSampleMethodRecord,
  IGetSamplePeriodRecord
} from 'interfaces/useSurveyApi.interface';
import { useContext } from 'react';
import { getCodesName } from 'utils/Utils';

const ObservationComponent = () => {
  const codesContext = useContext(CodesContext);

  const surveyContext = useContext(SurveyContext);

  const observationsTableContext = useObservationsTableContext();

  // Collect sample sites
  const surveySampleSites: IGetSampleLocationDetails[] = surveyContext.sampleSiteDataLoader.data?.sampleSites ?? [];
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
    sample_method_name:
      getCodesName(codesContext.codesDataLoader.data, 'sample_methods', method.method_lookup_id) ?? '',
    response_metric:
      getCodesName(codesContext.codesDataLoader.data, 'sample_methods', method.method_response_metric_id) ?? ''
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

  // The column definitions of the columns to render in the observations table
  const columns: GridColDef<IObservationTableRow>[] = [
    TaxonomyColDef({ hasError: observationsTableContext.hasError }),
    SampleSiteColDef({ sampleSiteOptions, hasError: observationsTableContext.hasError }),
    SampleMethodColDef({ sampleMethodOptions, hasError: observationsTableContext.hasError }),
    SamplePeriodColDef({ samplePeriodOptions, hasError: observationsTableContext.hasError }),
    ObservationCountColDef({ sampleMethodOptions, hasError: observationsTableContext.hasError }),
    ObservationDateColDef({ hasError: observationsTableContext.hasError }),
    ObservationTimeColDef({ hasError: observationsTableContext.hasError }),
    ObservationLatitudeColDef({ hasError: observationsTableContext.hasError }),
    ObservationLongitudeColDef({ hasError: observationsTableContext.hasError }),
    // Add measurement columns to the table
    ...observationsTableContext.measurementColumns.map((item) => item.colDef),
    ObservationActionsColDef({
      disabled: observationsTableContext.isSaving,
      onDelete: observationsTableContext.deleteObservationRecords
    })
  ];

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
            disabled={observationsTableContext.isSaving}
            onStart={() => observationsTableContext.setDisabled(true)}
            onSuccess={() => observationsTableContext.refreshObservationRecords()}
            onFinish={() => observationsTableContext.setDisabled(false)}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<Icon path={mdiPlus} size={1} />}
            onClick={() => observationsTableContext.addObservationRecord()}
            disabled={observationsTableContext.isSaving}>
            Add Record
          </Button>
          <Collapse in={observationsTableContext.hasUnsavedChanges} orientation="horizontal" sx={{ mr: -1 }}>
            <Box whiteSpace="nowrap" display="flex" sx={{ gap: 1, pr: 1 }}>
              <LoadingButton
                loading={observationsTableContext.isSaving}
                variant="contained"
                color="primary"
                onClick={() => observationsTableContext.saveObservationRecords()}
                disabled={observationsTableContext.isSaving}>
                Save
              </LoadingButton>
              <DiscardChangesButton
                disabled={observationsTableContext.isSaving}
                onDiscard={() => observationsTableContext.discardChanges()}
              />
            </Box>
          </Collapse>
          <ConfigureColumnsContainer disabled={observationsTableContext.isSaving} columns={columns} />
          <BulkActionsButton disabled={observationsTableContext.isSaving} />
        </Stack>
      </Toolbar>

      <Divider flexItem></Divider>

      <DataGridValidationAlert
        validationModel={observationsTableContext.validationModel}
        muiDataGridApiRef={observationsTableContext._muiDataGridApiRef.current}
      />

      <Box display="flex" flexDirection="column" flex="1 1 auto" position="relative">
        <Box position="absolute" width="100%" height="100%">
          <ObservationsTable
            isLoading={
              observationsTableContext.isLoading ||
              observationsTableContext.isSaving ||
              observationsTableContext.disabled
            }
            columns={columns}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default ObservationComponent;
