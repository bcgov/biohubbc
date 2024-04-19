import Box from '@mui/material/Box';
import assert from 'assert';
import InferredLocationDetails, { IInferredLayers } from 'components/boundary/InferredLocationDetails';
import { SurveyContext } from 'contexts/surveyContext';
import { Feature } from 'geojson';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useContext, useEffect, useState } from 'react';

/**
 * View survey - Study area section
 *
 * @return {*}
 */
const SurveyStudyArea = () => {
  const surveyContext = useContext(SurveyContext);
  const biohubApi = useBiohubApi();
  // Survey data must be loaded by the parent before this component is rendered
  assert(surveyContext.surveyDataLoader.data);
  const [inferredLayersInfo, setInferredLayersInfo] = useState<IInferredLayers>({
    parks: [],
    nrm: [],
    env: [],
    wmu: []
  });

  const locations = surveyContext.surveyDataLoader.data?.surveyData?.locations;

  useEffect(() => {
    let isMounted = true;

    const getRegions = async (features: Feature[]) => {
      try {
        const regions = await biohubApi.spatial.getRegions(features);

        if (!isMounted) {
          return;
        }

        setInferredLayersInfo({
          parks: regions.regions
            .filter((item) => item.sourceLayer === 'WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW')
            .map((item) => item.regionName),
          nrm: regions.regions
            .filter((item) => item.sourceLayer === 'WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG')
            .map((item) => item.regionName),
          env: regions.regions
            .filter((item) => item.sourceLayer === 'WHSE_ADMIN_BOUNDARIES.EADM_WLAP_REGION_BND_AREA_SVW')
            .map((item) => item.regionName),
          wmu: regions.regions
            .filter((item) => item.sourceLayer === 'WHSE_WILDLIFE_MANAGEMENT.WAA_WILDLIFE_MGMT_UNITS_SVW')
            .map((item) => item.regionName)
        });
      } catch (error) {
        console.error(error);
      }
    };

    if (!locations) {
      return;
    }

    const features: Feature[] = [];

    locations.forEach((item) => {
      item.geojson.forEach((geo) => {
        features.push(geo);
      });
    });

    getRegions(features);

    return () => {
      isMounted = false;
    };
  }, [biohubApi.spatial, locations]);

  return (
    <Box component="dl">
      <InferredLocationDetails layers={inferredLayersInfo} />
    </Box>
  );
};

export default SurveyStudyArea;
