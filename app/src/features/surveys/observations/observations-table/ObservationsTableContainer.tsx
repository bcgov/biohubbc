import { mdiPencil, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
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
import {
  GenericCommentColDef,
  GenericDateColDef,
  GenericLatitudeColDef,
  GenericLongitudeColDef,
  GenericTimeColDef
} from 'components/data-grid/GenericGridColumnDefinitions';
import { IObservationTableRow } from 'contexts/observationsTableContext';
import { BulkActionsButton } from 'features/surveys/observations/observations-table/bulk-actions/BulkActionsButton';
import {
  MethodTechniqueColDef,
  ObservationSignColDef,
  ObservationSubcountColDef,
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
  useObservationsTableContext,
  useSurveyContext
} from 'hooks/useContext';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import { useEffect, useMemo } from 'react';
import { useHistory } from 'react-router';
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

  const { projectId, surveyId } = useSurveyContext();
  const history = useHistory();

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const observationSignOptions = useMemo(
    () =>
      codesContext.codesDataLoader.data?.observation_signs.map((option) => ({
        observation_sign_id: option.id,
        name: option.name
      })) ?? [],
    [codesContext.codesDataLoader.data?.observation_signs]
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

  // Determine if the edit button should be enabled, and if so, which observation ID it should link to
  const editButtonObservationId: number | false = useMemo(() => {
    const selectedObservations = observationsTableContext.getSelectedRows();
    if (selectedObservations.length === 1 && selectedObservations[0].survey_observation_id) {
      return selectedObservations[0].survey_observation_id;
    }
    return false;
  }, [observationsTableContext]);

  // The column definitions of the columns to render in the observations table
  const columns: GridColDef<IObservationTableRow>[] = useMemo(
    () => {
      return [
        // Add standard observation columns to the table
        TaxonomyColDef(),
        SampleSiteColDef({
          samplingInformationCache: samplingInformationCache
        }),
        MethodTechniqueColDef({
          samplingInformationCache: samplingInformationCache
        }),
        SamplePeriodColDef({
          samplingInformationCache: samplingInformationCache
        }),
        ObservationSignColDef({ observationSignOptions }),
        ObservationSubcountColDef(),
        GenericDateColDef({
          field: 'observation_date',
          headerName: 'Date',
          description: 'The date when the observation was made',
          editable: false
        }),
        GenericTimeColDef({
          field: 'observation_time',
          headerName: 'Time',
          description: 'The time of day when the observation was made',
          editable: false
        }),
        GenericLatitudeColDef({
          field: 'latitude',
          headerName: 'Latitude',
          description: 'The latitude where the observation was made',
          editable: false
        }),
        GenericLongitudeColDef({
          field: 'longitude',
          headerName: 'Longitude',
          description: 'The longitude where the observation was made',
          editable: false
        }),
        // Add measurement columns to the table
        ...getMeasurementColumnDefinitions(observationsTableContext.measurementColumns),
        // Add environment columns to the table
        ...getEnvironmentColumnDefinitions(observationsTableContext.environmentColumns),
        GenericCommentColDef({
          field: 'comment',
          headerName: '',
          editable: false,
          handleOpen: (params: GridRenderEditCellParams) => observationsTableContext.setCommentDialogParams(params),
          handleClose: () => observationsTableContext.setCommentDialogParams(null)
        })
      ];
    },
    // observationsTableContext is listed as a missing dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      observationSignOptions,
      observationsTableContext.environmentColumns,
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
            disabled={observationsTableContext.isDisabled}
            onStart={() => observationsPageContext.setIsDisabled(true)}
            onSuccess={() => observationsTableContext.refreshRows()}
            onFinish={() => observationsPageContext.setIsDisabled(false)}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<Icon path={mdiPlus} size={1} />}
            onClick={() => history.push(`/admin/projects/${projectId}/surveys/${surveyId}/observations/create`)}
            disabled={observationsTableContext.isDisabled}>
            Add
          </Button>
          <Collapse
            in={!!editButtonObservationId}
            orientation="horizontal"
            sx={{
              // When the edit button is not visible, we need to compensate for the Stack 'gap' property by applying
              // a negative margin to this button.
              marginLeft: editButtonObservationId ? 0 : -1
            }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Icon path={mdiPencil} size={1} />}
              onClick={() => {
                history.push(
                  `/admin/projects/${projectId}/surveys/${surveyId}/observations/${editButtonObservationId}/edit`
                );
              }}
              disabled={observationsTableContext.isDisabled}>
              Edit
            </Button>
          </Collapse>
          <ConfigureColumnsButton disabled={observationsTableContext.isDisabled} columns={columns} />
          <ExportHeadersButton />
          <BulkActionsButton disabled={observationsTableContext.isDisabled} />
        </Stack>
      </Toolbar>

      <Divider flexItem />

      <ObservationSubcountCommentDialog
        // The key prop is necessary for the dialog to correctly reset if the user discards changes
        key={observationsTableContext.commentDialogParams?.id ?? 'comment-dialog-key'}
        open={Boolean(observationsTableContext.commentDialogParams)}
        initialValue={observationsTableContext.commentDialogParams?.value}
        handleClose={() => observationsTableContext.setCommentDialogParams(null)}
      />

      <Box display="flex" flexDirection="column" flex="1 1 auto" position="relative">
        <Box position="absolute" width="100%" height="100%">
          <ObservationsTable
            isLoading={
              !observationsContext.observationsDataLoader.data &&
              (observationsTableContext.isLoading ||
                observationsTableContext.isDisabled ||
                codesContext.codesDataLoader.isLoading)
            }
            columns={[...columns]}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default ObservationsTableContainer;
