import { GridColDef } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { CodesContext } from 'contexts/codesContext';
import { IObservationRecord } from 'contexts/observationsTableContext';
import { SurveyContext } from 'contexts/surveyContext';
import { TaxonomyContext } from 'contexts/taxonomyContext';
import dayjs from 'dayjs';
import { IGetSampleLocationRecord } from 'interfaces/useSurveyApi.interface';
import { useContext, useMemo } from 'react';
import { getCodesName } from 'utils/Utils';
import NoSurveySectionData from '../components/NoSurveySectionData';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import grey from '@mui/material/colors/grey';

interface IObservationTableRow {
  id: number;
  taxon: string | undefined;
  count: number | null;
  site: string | undefined;
  method: string | undefined;
  period: string | undefined;
  date: string | undefined;
  time: string | undefined;
  lat: number | null;
  long: number | null;
}
interface ISurveySpatialObservationDataTableProps {
  data: IObservationRecord[];
  sample_sites: IGetSampleLocationRecord[];
  isLoading: boolean;
}
const SurveySpatialObservationDataTable = (props: ISurveySpatialObservationDataTableProps) => {
  const surveyContext = useContext(SurveyContext);
  const codesContext = useContext(CodesContext);
  const taxonomyContext = useContext(TaxonomyContext);

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

  const tableData: IObservationTableRow[] = props.data.map((item) => {
    const siteName = sampleSites.find((site) => site.survey_sample_site_id === item.survey_sample_site_id)?.name;
    const method_id = sampleMethods.find(
      (method) => method?.survey_sample_method_id === item.survey_sample_method_id
    )?.method_lookup_id;
    const period = samplePeriods.find((period) => period?.survey_sample_period_id === item.survey_sample_period_id);

    return {
      id: item.survey_observation_id,
      taxon: taxonomyContext.getCachedSpeciesTaxonomyById(item.wldtaxonomic_units_id)?.label,
      count: item.count,
      site: siteName,
      method: method_id ? getCodesName(codesContext.codesDataLoader.data, 'sample_methods', method_id) : '',
      period: `${period?.start_date} ${period?.end_date}`,
      date: dayjs(item.observation_date).format('YYYY-MM-DD'),
      time: dayjs(item.observation_date).format('HH:mm:ss'),
      lat: item.latitude,
      long: item.longitude
    };
  });

  const columns: GridColDef<IObservationTableRow>[] = [
    {
      field: 'taxon',
      headerName: 'Species',
      flex: 1
    },
    {
      field: 'site',
      headerName: 'Sample Site',
      flex: 1
    },
    {
      field: 'method',
      headerName: 'Sample Method',
      flex: 1
    },
    {
      field: 'period',
      headerName: 'Sample Period',
      flex: 1
    },
    {
      field: 'count',
      headerName: 'Count',
      headerAlign: 'right',
      align: 'right',
      width: 100
    },
    {
      field: 'date',
      headerName: 'Date',
      width: 100
    },
    {
      field: 'time',
      headerName: 'Time',
      headerAlign: 'right',
      align: 'right',
      width: 100
    },
    {
      field: 'lat',
      headerName: 'Lat',
      headerAlign: 'right',
      align: 'right',
      width: 100
    },
    {
      field: 'long',
      headerName: 'Long',
      headerAlign: 'right',
      align: 'right',
      width: 100
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
  )

  return (
    <>
      {props.isLoading && (
        <Stack>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </Stack>
      )}

      {!props.isLoading && props.data.length === 0 && (
        <NoSurveySectionData text="No data available" paperVariant="outlined" />
      )}

      {!props.isLoading && props.data.length > 0 && (
        <>
          <StyledDataGrid
            columnHeaderHeight={RowHeight}
            autoHeight
            rows={tableData}
            getRowId={(row) => row.id}
            columns={columns}
            pageSizeOptions={[5]}
            rowSelection={false}
            checkboxSelection={false}
            hideFooter
            disableRowSelectionOnClick
            disableColumnSelector
            disableColumnFilter
            disableColumnMenu
            disableVirtualization
            sortingOrder={['asc', 'desc']}
            data-testid="survey-spatial-observation-data-table"
          />
        </>
      )}
    </>
  );
};

export default SurveySpatialObservationDataTable;
