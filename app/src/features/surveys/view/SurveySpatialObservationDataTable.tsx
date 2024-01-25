import grey from '@mui/material/colors/grey';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { IObservationRecordWithSamplingData } from 'contexts/observationsTableContext';
import { SurveyContext } from 'contexts/surveyContext';
import { TaxonomyContext } from 'contexts/taxonomyContext';
import dayjs from 'dayjs';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useContext, useEffect, useState } from 'react';

interface IObservationTableRow {
  survey_observation_id: number;
  itis_scientific_name: string | undefined;
  wldtaxonomic_units_id: number;
  count: number | null;
  survey_sample_site_name: string | null;
  survey_sample_method_name: string | null;
  survey_sample_period_start_datetime: string | null;
  observation_date: string;
  observation_time: string;
  latitude: number | null;
  longitude: number | null;
}
interface ISurveySpatialObservationDataTableProps {
  isLoading: boolean;
}
const SurveySpatialObservationDataTable = (props: ISurveySpatialObservationDataTableProps) => {
  const biohubApi = useBiohubApi();
  const surveyContext = useContext(SurveyContext);
  const taxonomyContext = useContext(TaxonomyContext);

  const [data, setData] = useState<IObservationRecordWithSamplingData[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const paginatedDataLoader = useDataLoader((page: number, limit: number, sort?: string, order?: 'asc' | 'desc') =>
    biohubApi.observation.getObservationRecords(surveyContext.projectId, surveyContext.surveyId, {
      page,
      limit,
      sort,
      order
    })
  );

  // page information has changed, fetch more data
  useEffect(() => {
    if (sortModel.length > 0) {
      if (sortModel[0].sort) {
        paginatedDataLoader.refresh(page, pageSize, sortModel[0].field, sortModel[0].sort);
      }
    } else {
      paginatedDataLoader.refresh(page, pageSize);
    }
  }, [page, pageSize, sortModel]);

  useEffect(() => {
    if (paginatedDataLoader.data) {
      setData(paginatedDataLoader.data.surveyObservations);
      setTotalRows(paginatedDataLoader.data.pagination.total);
    }
  }, [paginatedDataLoader.data]);

  const tableData: IObservationTableRow[] = data.map((item) => {
    return {
      survey_observation_id: item.survey_observation_id,
      itis_scientific_name: taxonomyContext.getCachedSpeciesTaxonomyById(item.wldtaxonomic_units_id)?.label,
      wldtaxonomic_units_id: item.wldtaxonomic_units_id,
      count: item.count,
      survey_sample_site_name: item.survey_sample_site_name,
      survey_sample_method_name: item.survey_sample_method_name,
      survey_sample_period_start_datetime: item.survey_sample_period_start_datetime,
      observation_date: dayjs(item.observation_date).format('YYYY-MM-DD'),
      observation_time: dayjs(item.observation_date).format('HH:mm:ss'),
      latitude: item.latitude,
      longitude: item.longitude
    };
  });

  const columns: GridColDef<IObservationTableRow>[] = [
    {
      field: 'itis_scientific_name',
      headerName: 'Species',
      flex: 1,
      minWidth: 200
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
  ];

  // Set height so we the skeleton loader will match table rows
  const RowHeight = 52;

  // Skeleton Loader template
  const SkeletonRow = () => (
    <Stack
      flexDirection="row"
      alignItems="center"
      gap={2}
      py={2}
      px={1}
      height={RowHeight}
      overflow="hidden"
      sx={{
        borderBottom: '1px solid ' + grey[300],
        '&:last-of-type': {
          borderBottom: 'none'
        },
        '& .MuiSkeleton-root': {
          flex: '1 1 auto'
        },
        '& *': {
          fontSize: '0.875rem'
        }
      }}>
      <Skeleton variant="text" />
      <Skeleton variant="text" />
      <Skeleton variant="text" />
      <Skeleton variant="text" />
      <Skeleton variant="text" />
      <Skeleton variant="text" />
      <Skeleton variant="text" />
      <Skeleton variant="text" />
      <Skeleton variant="text" />
    </Stack>
  );

  return (
    <>
      {props.isLoading ? (
        <Stack>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </Stack>
      ) : (
        <StyledDataGrid
          noRowsMessage="No observation records found"
          columnHeaderHeight={RowHeight}
          rowHeight={RowHeight}
          rows={tableData}
          rowCount={totalRows}
          paginationModel={{ pageSize, page }}
          onPaginationModelChange={(model) => {
            setPage(model.page);
            setPageSize(model.pageSize);
          }}
          pageSizeOptions={[5]}
          paginationMode="server"
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={(model) => setSortModel(model)}
          loading={paginatedDataLoader.isLoading}
          getRowId={(row) => row.survey_observation_id}
          columns={columns}
          rowSelection={false}
          checkboxSelection={false}
          disableColumnSelector
          disableColumnFilter
          disableColumnMenu
          disableVirtualization
          sortingOrder={['asc', 'desc']}
          data-testid="survey-spatial-observation-data-table"
        />
      )}
    </>
  );
};

export default SurveySpatialObservationDataTable;
