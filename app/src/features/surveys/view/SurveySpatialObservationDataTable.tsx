import { CodesContext } from 'contexts/codesContext';
import { IObservationRecord } from 'contexts/observationsTableContext';
import { SurveyContext } from 'contexts/surveyContext';
import { TaxonomyContext } from 'contexts/taxonomyContext';
import dayjs from 'dayjs';
import { IGetSampleLocationRecord } from 'interfaces/useSurveyApi.interface';
import { useContext, useMemo } from 'react';
import { getCodesName } from 'utils/Utils';
import NoSurveySectionData from '../components/NoSurveySectionData';
import SurveySpatialDataTable from './SurveySpatialDataTable';

interface ISurveySpatialObservationDataTableProps {
  data: IObservationRecord[];
  sample_sites: IGetSampleLocationRecord[];
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

  const mapData = (): string[][] => {
    return (
      props.data.map((item) => {
        const siteName = sampleSites.find((site) => site.survey_sample_site_id === item.survey_sample_site_id)?.name;
        const method_id = sampleMethods.find(
          (method) => method?.survey_sample_method_id === item.survey_sample_method_id
        )?.method_lookup_id;
        const period = samplePeriods.find((period) => period?.survey_sample_period_id === item.survey_sample_period_id);

        return [
          `${taxonomyContext.getCachedSpeciesTaxonomyById(item.wldtaxonomic_units_id)?.label}`,
          `${item.count}`,
          `${siteName}`,
          `${method_id ? getCodesName(codesContext.codesDataLoader.data, 'sample_methods', method_id) : ''}`,
          `${period?.start_date} ${period?.end_date}`,
          `${dayjs(item.observation_date).format('YYYY-MM-DD')}`,
          `${dayjs(item.observation_date).format('HH:mm:ss')}`,
          `${item.latitude}`,
          `${item.longitude}`
        ];
      }) || []
    );
  };

  return (
    <>
      {props.data.length > 0 ? (
        <SurveySpatialDataTable
          tableHeaders={[
            'Species',
            'Count',
            'Sample Site',
            'Sample Method',
            'Sample Period',
            'Date',
            'Time',
            'Lat',
            'Long'
          ]}
          tableRows={mapData()}
        />
      ) : (
        <NoSurveySectionData text="No data available" paperVariant="outlined" />
      )}
    </>
  );
};

export default SurveySpatialObservationDataTable;
