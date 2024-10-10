import blue from '@mui/material/colors/blue';
import { IStaticLayer } from 'components/map/components/StaticLayers';
import SurveyMap from 'features/surveys/view/SurveyMap';
import { IGetSampleLocationDetails } from 'interfaces/useSamplingSiteApi.interface';

export interface ISamplingSiteListMapProps {
  sampleSite: IGetSampleLocationDetails;
}

/**
 * Renders a list item for a single sampling site.
 *
 * @param {ISamplingSiteListMapProps} props
 * @return {*}
 */
export const SamplingSiteListMap = (props: ISamplingSiteListMapProps) => {
  const { sampleSite } = props;

  const staticLayers: IStaticLayer[] = [
    {
      layerName: 'Sample Sites',
      layerOptions: { color: blue[500], fillColor: blue[500] },
      features: [
        {
          id: sampleSite.survey_sample_site_id,
          key: `sampling-site-${sampleSite.survey_sample_site_id}`,
          geoJSON: sampleSite.geojson
        }
      ]
    }
  ];

  return (
    <>
      <SurveyMap staticLayers={staticLayers} isLoading={false} />
    </>
  );
};
