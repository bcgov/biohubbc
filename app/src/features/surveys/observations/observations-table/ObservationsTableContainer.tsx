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
import HelpButtonDialog from 'components/buttons/HelpButtonDialog';
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
  MethodTechniqueColDef,
  ObservationCountColDef,
  ObservationSubcountSignColDef,
  SamplePeriodColDef,
  SampleSiteColDef,
  TaxonomyColDef
} from 'features/surveys/observations/observations-table/grid-column-definitions/GridColumnDefinitions';
import { useSamplingInformationCache } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/useSamplingInformationCache';
import ObservationsTable from 'features/surveys/observations/observations-table/ObservationsTable';
import {
  useCodesContext,
  useObservationsContext,
  useObservationsPageContext,
  useObservationsTableContext
} from 'hooks/useContext';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import { useEffect, useMemo } from 'react';
import { ImportObservationsButton } from '../components/ImportObservationsButton';
import { ConfigureColumnsButton } from './configure-columns/ConfigureColumnsButton';
import ExportHeadersButton from './export-button/ExportHeadersButton';
import { ObservationSubcountCommentDialog } from './grid-column-definitions/comment/ObservationSubcountCommentDialog';
import {
  getEnvironmentColumnDefinitions,
  getMeasurementColumnDefinitions
} from './grid-column-definitions/GridColumnDefinitionsUtils';

const ObservationsTableContainer = () => {
  const codesContext = useCodesContext();

  const observationsPageContext = useObservationsPageContext();
  const observationsTableContext = useObservationsTableContext();
  const observationsContext = useObservationsContext();

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const observationSubcountSignOptions = useMemo(
    () =>
      codesContext.codesDataLoader.data?.observation_subcount_signs.map((option) => ({
        observation_subcount_sign_id: option.id,
        name: option.name
      })) ?? [],
    [codesContext.codesDataLoader.data?.observation_subcount_signs]
  );

  const samplingInformationCache = useSamplingInformationCache();

  useEffect(() => {
    if (!observationsContext.observationsDataLoader.data?.supplementaryObservationData.sampling_data?.length) {
      return;
    }

    samplingInformationCache.initCachedSamplingInformationRef({
      periods: observationsContext.observationsDataLoader.data.supplementaryObservationData.sampling_data
    });
  }, [
    observationsContext.observationsDataLoader.data?.supplementaryObservationData.sampling_data,
    samplingInformationCache
  ]);

  // The column definitions of the columns to render in the observations table
  const columns: GridColDef<IObservationTableRow>[] = useMemo(
    () => {
      return [
        // Add standard observation columns to the table
        TaxonomyColDef({ hasError: observationsTableContext.hasError }),
        SampleSiteColDef({
          samplingInformationCache: samplingInformationCache,
          hasError: observationsTableContext.hasError
        }),
        MethodTechniqueColDef({
          samplingInformationCache: samplingInformationCache,
          hasError: observationsTableContext.hasError
        }),
        SamplePeriodColDef({
          samplingInformationCache: samplingInformationCache,
          hasError: observationsTableContext.hasError
        }),
        ObservationSubcountSignColDef({ observationSubcountSignOptions, hasError: observationsTableContext.hasError }),
        ObservationCountColDef({
          samplingInformationCache: samplingInformationCache,
          hasError: observationsTableContext.hasError
        }),
        GenericDateColDef({
          field: 'observation_date',
          headerName: 'Date',
          hasError: observationsTableContext.hasError,
          description: 'The date when the observation was made'
        }),
        GenericTimeColDef({
          field: 'observation_time',
          headerName: 'Time',
          hasError: observationsTableContext.hasError,
          description: 'The time of day when the observation was made'
        }),
        GenericLatitudeColDef({
          field: 'latitude',
          headerName: 'Latitude',
          hasError: observationsTableContext.hasError,
          description: 'The latitude where the observation was made'
        }),
        GenericLongitudeColDef({
          field: 'longitude',
          headerName: 'Longitude',
          hasError: observationsTableContext.hasError,
          description: 'The longitude where the observation was made'
        }),
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
      ];
    },
    // observationsTableContext is listed as a missing dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      observationSubcountSignOptions,
      observationsTableContext.environmentColumns,
      observationsTableContext.hasError,
      observationsTableContext.measurementColumns,
      observationsTableContext.setCommentDialogParams
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
          <HelpButtonDialog markdownType={MarkdownTypeNameEnum.OBSERVATIONS} />
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
            Add
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
            columns={[...columns]}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default ObservationsTableContainer;
