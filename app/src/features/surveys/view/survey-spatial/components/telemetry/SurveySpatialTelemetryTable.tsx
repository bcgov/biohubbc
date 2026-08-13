import { mdiArrowTopRight } from '@mdi/js';
import { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useState } from 'react';
import { formatTimestampUtc } from 'utils/datetime';

// Set height so the skeleton loader will match table rows
const rowHeight = 52;

interface ITelemetryData {
  telemetry_id: string;
  deployment_id: number;
  critter_id: number;
  vendor: string;
  serial: string;
  acquisition_date: string;
  latitude: number | null;
  longitude: number | null;
}

/**
 * Component to display telemetry data in a table format.
 *
 * @returns {*} The rendered component.
 */
export const SurveySpatialTelemetryTable = () => {
  const surveyContext = useSurveyContext();

  const biohubApi = useBiohubApi();

  const [totalRows, setTotalRows] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const telemetryDataLoader = useDataLoader((page: number, limit: number, sort?: string, order?: 'asc' | 'desc') =>
    biohubApi.telemetry.getTelemetryForSurvey(
      surveyContext.projectId,
      surveyContext.surveyId,
      {}, // TODO: Pass filters here
      {
        page: page + 1, // This fixes an off-by-one error between the front end and the back end
        limit,
        sort,
        order
      }
    )
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
  }, [telemetryDataLoader.data]);

  const rows: ITelemetryData[] =
    telemetryDataLoader.data?.telemetry.map((item) => {
      return {
        telemetry_id: item.telemetry_id,
        deployment_id: item.deployment_id,
        critter_id: item.critter_id,
        vendor: item.vendor,
        serial: item.serial,
        acquisition_date: item.acquisition_date,
        latitude: item.latitude,
        longitude: item.longitude
      };
    }) ?? [];

  // Define table columns
  const columns: GridColDef<ITelemetryData>[] = [
    {
      field: 'telemetry_id',
      headerName: 'Telemetry ID',
      flex: 1
    },
    {
      field: 'deployment_id',
      headerName: 'Deployment ID',
      flex: 1
    },
    {
      field: 'critter_id',
      headerName: 'Critter ID',
      flex: 1
    },
    {
      field: 'serial',
      headerName: 'Device',
      flex: 1
    },
    {
      field: 'vendor',
      headerName: 'Vendor',
      flex: 1
    },
    {
      field: 'acquisition_date',
      headerName: 'Date (UTC)',
      flex: 1,
      valueFormatter: (params) => formatTimestampUtc(params.value, DATE_FORMAT.MediumDateTimeFormat)
    },
    {
      field: 'latitude',
      headerName: 'Latitude',
      flex: 1
    },
    {
      field: 'longitude',
      headerName: 'Longitude',
      flex: 1
    }
  ];

  return (
    <LoadingGuard
      isLoading={telemetryDataLoader.isLoading || !telemetryDataLoader.isReady}
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
        // columns
        columns={columns}
        columnHeaderHeight={rowHeight}
        // rows
        rows={rows}
        rowCount={totalRows}
        rowHeight={rowHeight}
        rowSelection={false}
        getRowId={(row) => row.telemetry_id}
        autoHeight={false}
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
        sortingOrder={['asc', 'desc']}
        sortModel={sortModel}
        onSortModelChange={(model) => setSortModel(model)}
        // misc
        checkboxSelection={false}
        disableRowSelectionOnClick
        disableColumnSelector
        disableColumnFilter
        disableColumnMenu
        disableVirtualization
        data-testid="survey-spatial-telemetry-data-table"
      />
    </LoadingGuard>
  );
};
