import Box from '@mui/material/Box';
import blue from '@mui/material/colors/blue';
import { IStaticLayer } from 'components/map/components/StaticLayers';
import SurveyMap from 'features/surveys/view/SurveyMap';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect } from 'react';

export const SamplingSiteMapContainer = () => {
  const surveyContext = useSurveyContext();
  const biohubApi = useBiohubApi();

  const samplingSiteGeometryDataLoader = useDataLoader(() =>
    biohubApi.samplingSite.getSampleSitesGeometry(surveyContext.projectId, surveyContext.surveyId)
  );

  useEffect(() => {
    samplingSiteGeometryDataLoader.load();
  }, [samplingSiteGeometryDataLoader]);

  const staticLayers: IStaticLayer[] =
    samplingSiteGeometryDataLoader.data?.sampleSites.map((sampleSite) => ({
      layerName: 'Sample Sites',
      layerOptions: { color: blue[500], fillColor: blue[500] },
      features: [
        {
          id: sampleSite.survey_sample_site_id,
          key: `sample-site-${sampleSite.survey_sample_site_id}`,
          geoJSON: sampleSite.geojson
        }
      ]
    })) ?? [];

  return (
    <Box height="400px" flex="1 1 auto">
      <SurveyMap staticLayers={staticLayers} isLoading={false} />
    </Box>
  );
};
