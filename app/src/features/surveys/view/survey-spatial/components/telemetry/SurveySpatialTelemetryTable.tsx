import { mdiArrowTopRight } from '@mdi/js';
import Typography from '@mui/material/Typography';
import { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { ScientificNameTypography } from 'features/surveys/animals/components/ScientificNameTypography';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { IAnimalDeploymentWithCritter } from 'interfaces/useSurveyApi.interface';
import { useEffect, useMemo, useState } from 'react';

// Set height so the skeleton loader will match table rows
const rowHeight = 52;

interface ITelemetryData {
  id: number;
  critter_id: number | null;
  device_id: number;
  frequency: number | null;
  frequency_unit: string | null;
  // start: string;
  end: string;
  itis_scientific_name: string;
}

/**
 * Component to display telemetry data in a table format.
 *
 * @returns {*} The rendered component.
 */
export const SurveySpatialTelemetryTable = () => {
  const codesContext = useCodesContext();
  const surveyContext = useSurveyContext();

  const biohubApi = useBiohubApi();

  const [totalRows, setTotalRows] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const telemetryDataLoader = useDataLoader((page: number, limit: number, sort?: string, order?: 'asc' | 'desc') =>
    biohubApi.telemetry.getTelemetryForSurvey(surveyContext.projectId, surveyContext.surveyId, {
      page: page + 1, // This fixes an off-by-one error between the front end and the back end
      limit,
      sort,
      order
    })
  );

  // Page information has changed, fetch more data
  useEffect(() => {
    if (sortModel.length > 0) {
      if (sortModel[0].sort) {
        telemetryDataLoader.refresh(page, pageSize, sortModel[0].field, sortModel[0].sort);
      }
    } else {
      telemetryDataLoader.refresh(page, pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, sortModel]);

  useEffect(() => {
    if (!telemetryDataLoader.data) {
      return;
    }

    setTotalRows(telemetryDataLoader.data.pagination.total);
  });

  const deploymentsDataLoader = useDataLoader(biohubApi.telemetryDeployment.getDeploymentsInSurvey);
  const critterDataLoader = useDataLoader(biohubApi.survey.getSurveyCritters);

  useEffect(() => {
    deploymentsDataLoader.load(surveyContext.projectId, surveyContext.surveyId);
    critterDataLoader.load(surveyContext.projectId, surveyContext.surveyId);
  }, [deploymentsDataLoader, telemetryDataLoader, critterDataLoader, surveyContext.projectId, surveyContext.surveyId]);

  /**
   * Merges critters with associated deployments
   *
   * @returns {ICritterDeployment[]} Critter deployments
   */
  const critterDeployments: IAnimalDeploymentWithCritter[] = useMemo(() => {
    const critterDeployments: IAnimalDeploymentWithCritter[] = [];
    const critters = critterDataLoader.data ?? [];
    const deployments = deploymentsDataLoader.data?.deployments ?? [];

    if (!critters.length || !deployments.length) {
      return [];
    }

    const critterMap = new Map(critters.map((critter) => [critter.critterbase_critter_id, critter]));

    deployments.forEach((deployment) => {
      const critter = critterMap.get(String(deployment.critterbase_critter_id));
      if (critter) {
        critterDeployments.push({ critter, deployment });
      }
    });

    return critterDeployments;
  }, [critterDataLoader.data, deploymentsDataLoader.data]);

  /**
   * Memoized calculation of table rows based on critter deployments data.
   * Formats dates and combines necessary fields for display.
   */
  const rows: ITelemetryData[] = useMemo(() => {
    return critterDeployments.map((item) => {
      return {
        // Critters in this table may use multiple devices across multiple timespans
        id: item.deployment.deployment2_id,
        critter_id: item.critter.critter_id,
        animal_id: item.critter.animal_id,
        device_id: item.deployment.device_id,
        // start: dayjs(item.deployment.attachment_start).format(DATE_FORMAT.MediumDateFormat),
        end: item.deployment.attachment_end_date
          ? dayjs(item.deployment.attachment_end_date).format(DATE_FORMAT.MediumDateFormat)
          : '',
        frequency: item.deployment.frequency ?? null,
        frequency_unit:
          codesContext.codesDataLoader.data?.frequency_units?.find(
            (frequencyUnit) => frequencyUnit.id === item.deployment.frequency_unit_id
          )?.name ?? null,
        itis_scientific_name: item.critter.itis_scientific_name
      };
    });
  }, [codesContext.codesDataLoader.data?.frequency_units, critterDeployments]);

  // Define table columns
  const columns: GridColDef<ITelemetryData>[] = [
    {
      field: 'animal_id',
      headerName: 'Nickname',
      flex: 1
    },
    {
      field: 'itis_scientific_name',
      headerName: 'Species',
      flex: 1,
      renderCell: (param) => {
        return (
          <ScientificNameTypography
            name={param.row.itis_scientific_name}
            textOverflow="ellipsis"
            noWrap
            overflow="hidden"
          />
        );
      }
    },
    {
      field: 'device_id',
      headerName: 'Device ID',
      flex: 1
    },
    {
      field: 'frequency',
      headerName: 'Frequency',
      flex: 1,
      renderCell: (param) => {
        return (
          <Typography>
            {param.row.frequency}&nbsp;
            <Typography component="span" color="textSecondary">
              {param.row.frequency_unit}
            </Typography>
          </Typography>
        );
      }
    },
    {
      field: 'start',
      headerName: 'Start Date',
      flex: 1
    },
    {
      field: 'end',
      headerName: 'End Date',
      flex: 1
    }
  ];

  return (
    <LoadingGuard
      isLoading={deploymentsDataLoader.isLoading}
      isLoadingFallback={<SkeletonTable />}
      isLoadingFallbackDelay={100}
      hasNoData={!rows.length}
      hasNoDataFallback={
        <NoDataOverlay
          height="100%"
          title="Add Telemetry"
          subtitle="Add telemetry devices to animals and upload device data"
          icon={mdiArrowTopRight}
        />
      }
      hasNoDataFallbackDelay={100}>
      <StyledDataGrid
        noRowsMessage={'No telemetry records found'}
        columnHeaderHeight={rowHeight}
        rowHeight={rowHeight}
        rows={rows}
        rowCount={totalRows}
        // pagination
        paginationMode="server"
        paginationModel={{ pageSize, page }}
        pageSizeOptions={[10, 25, 50]}
        onPaginationModelChange={(model) => {
          setPage(model.page);
          setPageSize(model.pageSize);
        }}
        // sorting
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={(model) => setSortModel(model)}
        getRowId={(row) => row.id}
        columns={columns}
        rowSelection={false}
        checkboxSelection={false}
        disableRowSelectionOnClick
        disableColumnSelector
        disableColumnFilter
        disableColumnMenu
        disableVirtualization
        sortingOrder={['asc', 'desc']}
        data-testid="survey-spatial-telemetry-data-table"
      />
    </LoadingGuard>
  );
};
