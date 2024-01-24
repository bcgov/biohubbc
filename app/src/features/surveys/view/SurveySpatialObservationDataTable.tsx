import grey from '@mui/material/colors/grey';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { CodesContext } from 'contexts/codesContext';
import { IObservationRecord } from 'contexts/observationsTableContext';
import { SurveyContext } from 'contexts/surveyContext';
import { TaxonomyContext } from 'contexts/taxonomyContext';
import dayjs from 'dayjs';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IGetSampleLocationRecord } from 'interfaces/useSurveyApi.interface';
import { useContext, useEffect, useMemo, useState } from 'react';
import { getCodesName } from 'utils/Utils';

interface IObservationTableRow {
  id: number;
  taxon: string | undefined;
  count: number | null;
  site: string | undefined;
  method: string | undefined;
  period: string | undefined;
  date: string | undefined;
  time: string | undefined;
  latitude: number | null;
  longitude: number | null;
}
interface ISurveySpatialObservationDataTableProps {
  sample_sites: IGetSampleLocationRecord[];
  isLoading: boolean;
}
const SurveySpatialObservationDataTable = (props: ISurveySpatialObservationDataTableProps) => {
  const biohubApi = useBiohubApi();
  const surveyContext = useContext(SurveyContext);
  const codesContext = useContext(CodesContext);
  const taxonomyContext = useContext(TaxonomyContext);

  const [data, setData] = useState<IObservationRecord[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
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
        console.log(`Table Sort: ${sortModel[0].field} ${sortModel[0].sort}`);
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

  const sampleSites = useMemo(() => {
    return surveyContext.sampleSiteDataLoader.data?.sampleSites ?? [];
  }, [surveyContext.sampleSiteDataLoader.data]);

  const sampleMethods = useMemo(() => {
    return surveyContext.sampleSiteDataLoader.data?.sampleSites.flatMap((item) => item.sample_methods) || [];
  }, [surveyContext.sampleSiteDataLoader.data]);

  const samplePeriods = useMemo(() => {
    return (
      surveyContext.sampleSiteDataLoader.data?.sampleSites.flatMap((item) =>
        item.sample_methods?.flatMap((method) => method.sample_periods)
      ) || []
    );
  }, [surveyContext.sampleSiteDataLoader.data]);

  const tableData: IObservationTableRow[] = data.map((item) => {
    const siteName = sampleSites.find((site) => site.survey_sample_site_id === item.survey_sample_site_id)?.name;
    const method_id = sampleMethods.find(
      (method) => method?.survey_sample_method_id === item.survey_sample_method_id
    )?.method_lookup_id;
    const period = samplePeriods.find((period) => period?.survey_sample_period_id === item.survey_sample_period_id);
    let periodString = '';
    if (period) {
      periodString = `${period.start_date} ${period.start_time ?? ''} - ${period.end_date} ${period.end_time ?? ''}`;
    }

    return {
      id: item.survey_observation_id,
      taxon: taxonomyContext.getCachedSpeciesTaxonomyById(item.wldtaxonomic_units_id)?.label,
      count: item.count,
      site: siteName,
      method: method_id ? getCodesName(codesContext.codesDataLoader.data, 'sample_methods', method_id) : '',
      period: periodString,
      date: dayjs(item.observation_date).format('YYYY-MM-DD'),
      time: dayjs(item.observation_date).format('HH:mm:ss'),
      latitude: item.latitude,
      longitude: item.longitude
    };
  });

  const columns: GridColDef<IObservationTableRow>[] = [
    {
      field: 'taxon',
      headerName: 'Species',
      flex: 1,
      minWidth: 200
    },
    {
      field: 'site',
      headerName: 'Sample Site',
      flex: 1,
      minWidth: 200
    },
    {
      field: 'method',
      headerName: 'Sample Method',
      flex: 1,
      minWidth: 200
    },
    {
      field: 'period',
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
      field: 'date',
      headerName: 'Date',
      maxWidth: 120
    },
    {
      field: 'time',
      headerName: 'Time',
      headerAlign: 'right',
      align: 'right',
      maxWidth: 100
    },
    {
      field: 'lat',
      headerName: 'Lat',
      headerAlign: 'right',
      align: 'right',
      maxWidth: 100
    },
    {
      field: 'long',
      headerName: 'Long',
      headerAlign: 'right',
      align: 'right',
      maxWidth: 100
    }
  ];

  // Set height so we the skeleton loader will match table rows
  const RowHeight = 40;

  // Skeleton Loader template
  const SkeletonRow = () => (
    <Stack
      flexDirection="row"
      alignItems="center"
      gap={2}
      p={2}
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
          columnHeaderHeight={RowHeight}
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
          getRowId={(row) => row.id}
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
