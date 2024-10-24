import { mdiArrowTopRight } from '@mdi/js';
import { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { SurveyContext } from 'contexts/surveyContext';
import dayjs from 'dayjs';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useTaxonomyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useContext, useEffect, useState } from 'react';

// Set height so the skeleton loader will match table rows
const rowHeight = 52;

interface IObservationTableRow {
  survey_observation_id: number;
  itis_tsn: number | null;
  itis_scientific_name: string | null;
  count: number | null;
  survey_sample_site_name: string | null;
  survey_sample_method_name: string | null;
  survey_sample_period_start_datetime: string | null;
  observation_date: string;
  observation_time: string;
  latitude: number | null;
  longitude: number | null;
}

interface ISurveyDataObservationTableProps {
  isLoading: boolean;
}

/**
 * Component to display observation data in a table with server-side pagination and sorting.
 *
 * @param {ISurveyDataObservationTableProps} props - Component properties.
 * @returns {JSX.Element} The rendered component.
 */
export const SurveySpatialObservationTable = (props: ISurveyDataObservationTableProps) => {
  const biohubApi = useBiohubApi();
  const surveyContext = useContext(SurveyContext);
  const taxonomyContext = useTaxonomyContext();

  const [totalRows, setTotalRows] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [rows, setTableData] = useState<IObservationTableRow[]>([]);
  const [tableColumns, setTableColumns] = useState<GridColDef<IObservationTableRow>[]>([]);

  const paginatedDataLoader = useDataLoader((page: number, limit: number, sort?: string, order?: 'asc' | 'desc') =>
    biohubApi.observation.getObservationRecords(surveyContext.projectId, surveyContext.surveyId, {
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
        paginatedDataLoader.refresh(page, pageSize, sortModel[0].field, sortModel[0].sort);
      }
    } else {
      paginatedDataLoader.refresh(page, pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, sortModel]);

  // Update table data and columns when new data is loaded
  useEffect(() => {
    if (paginatedDataLoader.data) {
      setTotalRows(paginatedDataLoader.data.pagination.total);

      setTableData(
        paginatedDataLoader.data.surveyObservations.map((item) => {
          return {
            survey_observation_id: item.survey_observation_id,
            itis_tsn: item.itis_tsn,
            itis_scientific_name:
              (item.itis_tsn && taxonomyContext.getCachedSpeciesTaxonomyById(item.itis_tsn)?.scientificName) || null,
            count: item.count,
            survey_sample_site_name: item.survey_sample_site_name,
            survey_sample_method_name: item.survey_sample_method_name,
            survey_sample_period_start_datetime: item.survey_sample_period_start_datetime,
            observation_date: dayjs(item.observation_date).format('YYYY-MM-DD'),
            observation_time: dayjs(item.observation_date).format('HH:mm:ss'),
            latitude: item.latitude,
            longitude: item.longitude
          };
        })
      );

      setTableColumns([
        {
          field: 'itis_scientific_name',
          headerName: 'Species',
          flex: 1,
          minWidth: 200,
          renderCell: (params) => <em>{params.row.itis_scientific_name}</em>
        },
        {
          field: 'survey_sample_site_name',
          headerName: 'Sample Site',
          flex: 1,
          minWidth: 200
        },
        {
          field: 'survey_sample_method_name',
          headerName: 'Sample Method',
          flex: 1,
          minWidth: 200
        },
        {
          field: 'survey_sample_period_start_datetime',
          headerName: 'Sample Period',
          flex: 1,
          minWidth: 200
        },
        {
          field: 'count',
          headerName: 'Count',
          headerAlign: 'right',
          align: 'right',
          maxWidth: 100
        },
        {
          field: 'observation_date',
          headerName: 'Date',
          maxWidth: 120
        },
        {
          field: 'observation_time',
          headerName: 'Time',
          headerAlign: 'right',
          align: 'right',
          maxWidth: 100
        },
        {
          field: 'latitude',
          headerName: 'Lat',
          headerAlign: 'right',
          align: 'right',
          maxWidth: 100
        },
        {
          field: 'longitude',
          headerName: 'Long',
          headerAlign: 'right',
          align: 'right',
          maxWidth: 100
        }
      ]);
    }
  }, [paginatedDataLoader.data, taxonomyContext]);

  return (
    <LoadingGuard
      isLoading={props.isLoading || paginatedDataLoader.isLoading || !paginatedDataLoader.isReady}
      isLoadingFallback={<SkeletonTable />}
      isLoadingFallbackDelay={100}
      hasNoData={!rows.length}
      hasNoDataFallback={
        <NoDataOverlay
          height="100%"
          title="Add Observations"
          subtitle="After adding sampling information, upload observations and link them to sampling efforts"
          icon={mdiArrowTopRight}
        />
      }
      hasNoDataFallbackDelay={100}>
      <StyledDataGrid
        noRowsMessage="No observation records found"
        columnHeaderHeight={rowHeight}
        rowHeight={rowHeight}
        rows={rows}
        rowCount={totalRows}
        paginationModel={{ pageSize, page }}
        onPaginationModelChange={(model) => {
          setPage(model.page);
          setPageSize(model.pageSize);
        }}
        pageSizeOptions={[10, 25, 50]}
        paginationMode="server"
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={(model) => setSortModel(model)}
        loading={paginatedDataLoader.isLoading}
        getRowId={(row) => row.survey_observation_id}
        columns={tableColumns}
        rowSelection={false}
        autoHeight={false}
        checkboxSelection={false}
        disableColumnSelector
        disableColumnFilter
        disableColumnMenu
        disableVirtualization
        data-testid="survey-spatial-observation-data-table"
      />
    </LoadingGuard>
  );
};
