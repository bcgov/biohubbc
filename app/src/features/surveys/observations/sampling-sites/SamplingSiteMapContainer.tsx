import Box from '@mui/material/Box';
import blue from '@mui/material/colors/blue';
import { IStaticLayer } from 'components/map/components/StaticLayers';
import SurveyMap from 'features/surveys/view/SurveyMap';
import { IGetSampleLocationDetails } from 'interfaces/useSamplingSiteApi.interface';

interface ISamplingSitesMapContainerProps {
  samplingSites: IGetSampleLocationDetails[];
}

const SamplingSiteMapContainer = (props: ISamplingSitesMapContainerProps) => {
  const staticLayers: IStaticLayer[] = props.samplingSites.map((sampleSite) => ({
    layerName: 'Sample Sites',
    layerColors: { color: blue[500], fillColor: blue[500] },
    features: [
      {
        key: sampleSite.survey_sample_site_id,
        geoJSON: sampleSite.geojson
      }
    ]
  }));

  return (
    <Box height="400px" flex="1 1 auto">
      <SurveyMap staticLayers={staticLayers} supplementaryLayers={[]} isLoading={false} />
    </Box>
  );
};

export default SamplingSiteMapContainer;
