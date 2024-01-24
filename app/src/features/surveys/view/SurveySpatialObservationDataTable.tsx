import { GridColDef } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { SkeletonList } from 'components/loading/SkeletonLoaders';
import { CodesContext } from 'contexts/codesContext';
import { IObservationRecord } from 'contexts/observationsTableContext';
import { SurveyContext } from 'contexts/surveyContext';
import { TaxonomyContext } from 'contexts/taxonomyContext';
import dayjs from 'dayjs';
import { IGetSampleLocationRecord } from 'interfaces/useSurveyApi.interface';
import { useContext, useMemo } from 'react';
import { getCodesName } from 'utils/Utils';
import NoSurveySectionData from '../components/NoSurveySectionData';

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
      field: 'count',
      headerName: 'Count',
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
      field: 'date',
      headerName: 'Date',
      flex: 1
    },
    {
      field: 'time',
      headerName: 'Time',
      flex: 1
    },
    {
      field: 'lat',
      headerName: 'Lat',
      flex: 1
    },
    {
      field: 'long',
      headerName: 'Long',
      flex: 1
    }
  ];

  return (
    <>
      {props.isLoading && <SkeletonList />}

      {!props.isLoading && props.data.length === 0 && (
        <NoSurveySectionData text="No data available" paperVariant="outlined" />
      )}

      {!props.isLoading && props.data.length > 0 && (
        <>
          <StyledDataGrid
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
